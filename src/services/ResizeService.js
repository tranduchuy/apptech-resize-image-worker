const async = require('async');
const config = require('config');
const sharp = require('sharp');
const fs = require('fs');
const {deleteFiles} = require('../utils/FileUtil');
const {makeFolders} = require('../utils/FolderUtil');

const {generateFolderTempByDate} = require('../utils/StringUtil');


const sizes = config.get('size_widths');

const getFileName = (path) => {
    const eles = path.split('\/');
    if (eles.length === 0) {
        return '';
    }

    return eles[eles.length - 1];
};

/**
 * 
 * @param {string} sourceFilePath 
 * @param {number} width 
 * @param {string} folderName 
 * @param {Function} cb 
 */
const resizeOneImage = (sourceFilePath, width, folderName, cb) => {
    const staticFolderImage = config.get('staticImgFolder');
    const newFileName = getFileName(sourceFilePath);

    if (newFileName === '') {
        return cb(new Error('File name not found'));
    }

    const datePathFolderWithSize = generateFolderTempByDate(width);
    const datePathFolderNoSize = generateFolderTempByDate();

    const newFolderPath = `${global.APP_DIR}/public/${staticFolderImage}/${folderName}/${datePathFolderWithSize}`;

    makeFolders([newFolderPath], (err) => {
        if (err) {
            return cb(err);
        }

        let targetFile = `${newFolderPath}/${newFileName}`;

        sharp(sourceFilePath)
            .resize(width)
            .toFile(targetFile, (err) => {
                if (err) {
                    console.error(err);
                    return cb(err);
                }

                return cb(null, `${datePathFolderNoSize}/${newFileName}`);
            });
    });
};

const resizeImageToMultipleSize = (sourceFilePath, folderName, callback) => {
    if (sourceFilePath === null) {
        return callback(null, [null]);
    }

    async.map(sizes, (width, cb) => {
        resizeOneImage(sourceFilePath, width, folderName, cb);
    }, callback);
};

const resizeMultipleImage = (sources, folderName, callback) => {

    const finalResults = [];

    async.eachSeries(sources, (source, cb) => {
        resizeImageToMultipleSize(source, folderName, (err, results) => {
            if (err) {
                return cb(err);
            }

            finalResults.push(results[0]);
            return cb(null);
        });
    }, (err) => {
        callback(err, finalResults);
    });
};

const removeOldImages = (paths, cb) => {
    const staticImgFolder = config.get('staticImgFolder');
    const _paths = [...paths];
    const fullPathToDelete = [];

    _paths.forEach(p => {
        sizes.forEach((width) => {
            fullPathToDelete.push(`${global.APP_DIR}/public/${staticImgFolder}using/${width}/${p}`);
        });
    });

    deleteFiles(fullPathToDelete, cb);
};

/**
 *
 * @param {string[]} paths
 */
const checkOriginalImageExist = (paths) => {
    const tmpFolderImage = config.get('tmpImgFolder');
    const notExistsFiles = [];

    paths.forEach((p) => {
        const fullPath = `${global.APP_DIR}/public/${tmpFolderImage}original/${p}`;

        if (!fs.existsSync(fullPath)) {
            notExistsFiles.push(fullPath);
        }
    });

    return notExistsFiles;
};

module.exports = {
    resizeOneImage,
    resizeImageToMultipleSize,
    resizeMultipleImage,
    checkOriginalImageExist,
    removeOldImages
};