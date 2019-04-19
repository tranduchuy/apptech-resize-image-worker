const config = require('config');
const mongoConfig = config.get('mongo');
const mongoose = require('mongoose');
const ENV = process.env.NODE_ENV;

module.exports = (callback) => {
    // let connectDbStr = `mongodb://${mongoConfig['host']}:${mongoConfig['port']}/${mongoConfig['databaseName']}`;
    //
    // if (ENV === 'production' || ENV === 'development') {
    //     connectDbStr = `mongodb://${mongoConfig.username}:${mongoConfig.password}@${mongoConfig['host']}:${mongoConfig['port']}/${mongoConfig['databaseName']}`;
    // }

    const connectDbStr = `mongodb+srv://${mongoConfig.username}:${mongoConfig.password}@hecta-ye9xf.mongodb.net/hecta_v2?retryWrites=true`;

    mongoose.connect(connectDbStr, {useNewUrlParser: true}, function (err) {
        if (err) {
            throw err;
        } else {
            callback();
        }
    });
};
