const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const buySchema = new Schema({
    title: String,
    description: String,
    keywordList: Array,
    formality: Number,
    type: Number,
    city: String,
    district: Number,
    ward: Number,
    street: Number,
    project: String,
    areaMin: Number,
    areaMax: Number,
    priceMin: Number,
    priceMax: Number,
    unit: Number,
    address: String,
    images: Array,
    contactName: String,
    contactAddress: String,
    contactPhone: String,
    contactMobile: String,
    contactEmail: String,
    receiveMail: Boolean,
    admin: {type: Array, default: []},
    status: {type: Number, default: 2},
    date: {type: Number, default: Date.now}
});

const BuyModel = mongoose.model('Buy', buySchema, 'Buys');
module.exports = BuyModel;
module.exports.Model = buySchema;
