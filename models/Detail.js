const { Schema, model, ObjectId } = require('mongoose');

const Detail = new Schema({
    title: {type: String},
    categories: [{type: String}],
    description: {type: Object},
    view: {type: Number},
    admin: {type: ObjectId}
})

module.exports = model('Detail', Detail);