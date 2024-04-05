const { Schema, model, ObjectId } = require('mongoose');

const Category = new Schema({
    _id: {type: String}
})

module.exports = model('Category', Category);