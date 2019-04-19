const requireAll = require('require-all');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

module.exports = requireAll({
    dirname: __dirname,
    filter: /(.+Model)\.js$/,
    resolve: function (Model) {
        return Model;
    }
});