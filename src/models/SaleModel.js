const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const saleSchema = new Schema({
    title: String,
    formality: Number,
    type: Number,
    city: String,
    district: Number,
    ward: Number,
    street: Number,
    project: String,
    area: Number,
    price: Number,
    unit: Number,
    address: String,
    keywordList: Array,
    description: String,
    streetWidth: Number,
    frontSize: Number,
    direction: Number,
    balconyDirection: Number,
    floorCount: Number,
    bedroomCount: Number,
    toiletCount: Number,
    furniture: String,
    images: Array,
    contactName: String,
    contactAddress: String,
    contactPhone: String,
    contactMobile: String,
    contactEmail: String,
    admin: {type: Array, default: []},
    status: {type: Number, default: 2},
    date: {type: Number, default: Date.now},
});

const SaleModel = mongoose.model('Sale', saleSchema, 'Sales');
module.exports = SaleModel;
module.exports.Model = saleSchema;
