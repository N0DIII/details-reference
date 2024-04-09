const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const multer  = require('multer');
require('dotenv').config();
const PORT = process.env.PORT;

const Admin = require('./models/Admin');
const Category = require('./models/Category');
const Detail = require('./models/Detail');

const app = express();

const storageConfig = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
})

app.use(cors({origin: '*'}));
app.use(express.static('public'));
app.use(express.static('build'));
app.use(express.json());

const start = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        app.listen(PORT, () => console.log(`server started on port ${PORT}`));
    }
    catch(e) {
        console.log(e);
    }
}

start();

const generateAccessToken = (id) => {
    const payload = { id };
    return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '30d' });
}

app.get('*', (req, res) => {
    res.sendFile(__dirname + '/build/index.html');
})

app.post('/auth', async (req, res) => {
    try {
        const token = req.headers.authorization;
        if(token == 'null') return res.json({ auth: false });

        const decodedData = jwt.verify(token, process.env.SECRET_KEY);
        const admin = await Admin.findOne({ _id: decodedData.id }, { password: 0 });

        if(admin) return res.json({ auth: true, _id: admin._id, name: admin.name });
        else return res.json({ auth: false });
    }
    catch(e) {
        return res.json({ auth: false });
    }
})

app.post('/login', async (req, res) => {
    const { name, password } = req.body;

    const admin = await Admin.findOne({ name });
    if(admin == null) return res.json(`Администратор ${name} не найден`);

    const validPassword = bcrypt.compareSync(password, admin.password);
    if(!validPassword) return res.json('Введен неверный пароль');

    const token = generateAccessToken(admin._id);
    return res.json({ token });
})

app.post('/registration', async (req, res) => {
    const { name, password, repeatPassword } = req.body;

    if(name.trim() == '') return res.json('Имя администратора не может быть пустым');
    if(name.length > 20) return res.json('Имя администратора не может быть длиннее 20 символов');
    if(password.length < 5) return res.json('Пароль должен быть длиннее 4 символов');
    if(password.length > 20) return res.json('Пароль не может быть длиннее 20 символов');
    if(password != repeatPassword) return res.json('Пароли не совпадают');

    const candidate = await Admin.findOne({ name });
    if(candidate) return res.json('Администратор с таким именем уже существует');

    const hashPassword = bcrypt.hashSync(password, 7);

    const admin = new Admin({ name, password: hashPassword });
    await admin.save();

    const token = generateAccessToken(admin._id);
    return res.json({ token });
})

app.post('/getCategories', async (req, res) => {
    const categories = await Category.find();
    res.json(categories);
})

app.post('/editor', multer({ storage: storageConfig }).single('image'), async (req, res) => {
    res.json({ 'success' : 1, 'file': { 'url' : process.env.SERVER_URL + '/uploads/' + req.file.originalname } });
})

app.post('/addDetail', async (req, res) => {
    const { title, savedData, categories, admin } = req.body;

    if(title.trim() == '') return res.json({ error: true, message: 'Название не может быть пустым' });
    if(savedData.blocks.length == 0) return res.json({ error: true, message: 'Описание не может быть пустым' });

    const detail = new Detail({ title, description: savedData, view: 0, admin, categories });
    await detail.save();

    res.json({ error: false, id: detail._id });
})

app.post('/editDetail', async (req, res) => {
    const { title, savedData, categories, admin, id } = req.body;

    if(title.trim() == '') return res.json({ error: true, message: 'Название не может быть пустым' });
    if(savedData.blocks.length == 0) return res.json({ error: true, message: 'Описание не может быть пустым' });

    await Detail.updateOne({ _id: id }, { $set: { title, description: savedData, categories } });

    res.json({ error: false, id });
})

app.post('/getDetails', async (req, res) => {
    const { search, count, selectedCategories } = req.body;

    let details = [];
    if(selectedCategories.length == 0) details = await Detail.find({ title: { $regex: search } }).skip(count * 15).limit(15);
    else details = await Detail.find({ title: { $regex: search }, categories: { $in: selectedCategories } }).skip(count * 15).limit(15);

    for(let i = 0; i < details.length; i++) {
        let cover = '';

        for(let j = 0; j < details[i].description.blocks.length; j++) {
            const block = details[i].description.blocks[j];
            if(block.type == 'image') {
                cover = block.data.file.url;
                break;
            }
        }

        details[i] = { ...details[i]._doc, cover };
    }

    res.json(details);
})

app.post('/getDetail', async (req, res) => {
    const { id } = req.body;

    try {
        const detail = await Detail.findOne({ _id: id });
        if(detail != null) await Detail.updateOne({ _id: id }, { $set: { view: detail.view + 1 } });

        res.json(detail);
    }
    catch(e) {
        res.json(null);
    }
})

app.post('/deleteDetail', async (req, res) => {
    const { id } = req.body;

    const detail = await Detail.findOne({ _id: id });
    await Detail.deleteOne({ _id: id });

    for(let i = 0; i < detail.description.blocks.length; i++) {
        const block = detail.description.blocks[i];
        if(block.type == 'image') {
            const url = block.data.file.url;
            const file = url.split('/')[url.split('/').length - 1];
            fs.rm(`./public/uploads/${file}`, {recursive: true}, e => {if(e) console.log(e)});
        }
    }

    res.json(true);
})