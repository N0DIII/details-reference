const { Schema, model, ObjectId } = require('mongoose');

const Admin = new Schema({
    name: {type: String},
    password: {type: String}
})

module.exports = model('Admin', Admin);