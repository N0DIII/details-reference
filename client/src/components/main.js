const { useState, useEffect } = require('react');
const { server } = require('../server');

require('../styles/main.css');

const Login = require('./login').default;
const Registration = require('./registration').default;
const Dropmenu = require('./dropmenu').default;
const AddDetail = require('./add_detail').default;
const Detailslist = require('./detailslist').default;

export default function Main(props) {
    const { userData } = props;

    const [search, setSearch] = useState('');
    const [count, setCount] = useState('');
    const [showLogin, setShowLogin] = useState(false);
    const [showReg, setShowReg] = useState(false);
    const [loginText, setLoginText] = useState(['', 'Войти']);
    const [showAddDetail, setShowAddDetail] = useState(false);
    const [edit, setEdit] = useState(false);
    const [oldDetail, setOldDetail] = useState(null);

    const [categories, setCategories] = useState(null);
    const [selectedCategories, setSelectedCategories] = useState([]);

    const [details, setDetails] = useState(null);

    useEffect(() => {
        if(!userData) return;
        if(!userData.auth) return;

        setLoginText([userData.name, 'Выйти']);
    }, [userData])

    useEffect(() => {
        server('/getCategories').then(result => setCategories(result));

    }, [])

    useEffect(() => {
        server('/getDetails', { search, count, selectedCategories }).then(result => setDetails(result));
    }, [search, selectedCategories])

    function login() {
        if(userData.name) {
            localStorage.removeItem('token');
            window.location.reload();
        }
        else {
            setShowLogin(true)
        }
    }

    function deleteDetail(id) {
        server('/deleteDetail', { id })
        .then(result => {
            if(result) setDetails(details.filter(detail => detail._id != id));
        })
    }

    function editDetail(id) {
        setEdit(true);
        setOldDetail(details.filter(detail => detail._id == id)[0]);
    }

    return(
        <div className='main_wrapper'>
            <div className='header'>
                <div className='header_logo'>Онлайн-справочник</div>
                <input className='header_search' type='text' placeholder='Поиск...' value={search} onChange={e => {setSearch(e.target.value); setCount(0)}}/>
                <div className='header_login_wrapper'>
                    <div className='header_name'>{loginText[0]}</div>
                    {userData.name && <button className='main_button header_reg' onClick={() => setShowReg(!showReg)}>Добавить администратора</button>}
                    <button className='main_button' onClick={login}>{loginText[1]}</button>
                </div>
            </div>

            {showLogin && <Login setShow={setShowLogin}/>}
            {showReg && <Registration setShow={setShowReg}/>}

            <div className='navigation'>
                <Dropmenu items={categories} title='Категории' selected={selectedCategories} setSelected={setSelectedCategories}/>
                <div className='navigation_selected'>
                    {selectedCategories.map((category, i) =>
                        <div key={i} className='navigation_selected_item'>
                            {category._id}{category._id != selectedCategories[selectedCategories.length - 1]._id && ','}
                        </div>
                    )}
                </div>
                {userData.name && <button className='main_button add_detail' onClick={() => setShowAddDetail(!showAddDetail)}>Добавить деталь</button>}
            </div>

            {showAddDetail && <AddDetail setShow={setShowAddDetail} admin={userData._id}/>}
            {edit && <AddDetail setShow={setEdit} admin={userData._id} edit={true} oldDetail={oldDetail}/>}

            <Detailslist
                items={details}
                admin={userData?.name != undefined ? true : false}
                deleteDetail={deleteDetail}
                editDetail={editDetail}
            />
        </div>
    )
}