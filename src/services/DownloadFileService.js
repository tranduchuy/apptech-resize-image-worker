const async = require('async');
const request = require('request');
const log4js = require('log4js');
const logger = log4js.getLogger('Services');
const path = require('path');
const fs = require('fs');
const folderUtils = require('../utils/FolderUtil');
const fileUtils  = require('../utils/FileUtil');

const run = (urls, callback) => {
    const results = [];
    const downloadFolderPath = global.APP_DIR + '/public/download';

    folderUtils.makeFolders([downloadFolderPath], () => {
        async.eachSeries(urls, (url, cb) => {
            if (url.indexOf('http') === -1) {
                logger.error('DownloadFileService::run::Invalid url, cannot parse uri', url);
                results.push(null);
                return cb(null);
            }

            let uri, filename, r;

            try {
                uri = path.parse(url);
                filename = fileUtils.uniqueid() + '_' + uri.name + uri.ext;
                r = request(url, {timeout: 5 * 60 * 1000});
            } catch (e) {
                logger.error('DownloadFileService::run::Invalid url, cannot parse uri', e);
                results.push(null);
                return callback(null);
            }

            r.on('response', function (res) {
                if (res.statusCode === 200 && res.headers['content-type'].indexOf('image') !== -1) {
                    const pathToFile = path.join(downloadFolderPath, filename);
                    res.pipe(fs.createWriteStream(pathToFile));
                    results.push(pathToFile);
                } else {
                    logger.warn('DownloadFileService::run::cannot download file', url);
                    results.push(null);
                }

                return cb(null);
            });
        }, (err) => {
            callback(err, results);
        });
    });
};

module.exports = run;