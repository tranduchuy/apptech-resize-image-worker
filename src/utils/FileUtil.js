const fs = require('fs');
const async = require('async');
const moment = require('moment');
const uniqid = require('uniqid');

/**
 * Remove multiple files by their paths
 * @param {string[]} paths
 * @param {Function} callback
 */
const deleteFiles = (paths, callback) => {
    async.each(paths, (p, cb) => {
        if (fs.existsSync(p)) {
            return fs.unlink(p, cb);
        }

        console.warn('File not exist: ', p);
        return cb(null);
    }, callback);
};

const uniqueid = (withPrefixDate) => {
    let name = '';

    if (withPrefixDate !== false) {
        name += moment().format('YYYYMMDDHHmmss') + '_';
    }

    name += uniqid();

    return name;
};

module.exports = {
    deleteFiles,
    uniqueid
};