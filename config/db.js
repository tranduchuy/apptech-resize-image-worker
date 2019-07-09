const config = require('config');
const mongoURI = config.get('mongoURI');
const mongoose = require('mongoose');

module.exports = (callback) => {
    mongoose.connect(mongoURI, {useNewUrlParser: true}, function (err) {
        if (err) {
            throw err;
        } else {
            callback();
        }
    });
};
