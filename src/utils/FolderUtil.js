const async = require('async');
const mkdirp = require('mkdirp');

const makeFolders = (paths, callback) => {
  async.each(paths, (path, cb) => {
    mkdirp(path, cb);
  }, callback);
};

module.exports = {
  makeFolders
};