const ricTypes = require('../constants/ric-type');
const models = require('../models');
const SaleModel = models['SaleModel'];
const BuyModel = models['BuyModel'];
const ProjectModel = models['ProjectModel'];
const NewsModel = models['NewsModel'];
const downloadService = require('./DownloadFileService');
const async = require('async');
const log4js = require('log4js');
const logger = log4js.getLogger('Services');
const resizeService = require('./ResizeService');
const fileUtils = require('../utils/FileUtil');

/*
* imgArr: []{id, text}
* finalUrls: []{string|null}
* */
const removeNullIdImage = (imgArr, finalUrls) => {
    const result = [];

    finalUrls.forEach((url, index) => {
        if (url !== null) {
            result.push({...imgArr[index], id: url});
        }
    });

    return result;
};

const downloadAndResizeImages = (urls, callback) => {
    logger.info('RICService::downloadAndResizeImages is called');
    async.waterfall([
        (cb) => {
            downloadService(urls, cb);
        },
        (urls, cb) => {
            if (urls.length === 0) {
                return cb(null, []);
            }

            const nullValues = {};
            const notNullValues = urls.filter(u => u);
            urls.forEach((u, index) => {
                if (u === null) {
                    nullValues[index] = u;
                }
            });

            logger.info('RICService::downloadAndResizeImages::final urls', notNullValues);

            resizeService.resizeMultipleImage(notNullValues, 'using', (err, finalUrls) => {
                fileUtils.deleteFiles(notNullValues, () => { });

                if (err) {
                    return cb(err);
                }

                for (const index in nullValues) {
                    finalUrls.splice(parseInt(index), 0, null);
                }

                cb(null, finalUrls);
            });
        }
    ], callback);
};

const handleCaseSale = (objectId, callback) => {
    /*
    * Sale chỉ có hình ảnh ở field: images
    * */

    SaleModel.findOne({_id: objectId}, (err, sale) => {
        if (err) {
            return callback(err);
        }

        if (!sale) {
            return callback(new Error('Sale not found: ' + objectId));
        }

        downloadAndResizeImages(sale.images, (err, finalUrls) => {
            if (err) {
                return logger.error("RICService::handleCaseSale::error", err);
            }

            sale.images = finalUrls.filter(u => u !== null);
            sale.save((err) => {
                if (err) {
                    return logger.error(err.message);
                }

                logger.info('Resizing images success: ', finalUrls);
                return callback(null);
            });
        });
    });
};

const handleCaseBuy = (objectId, callback) => {
    /*
    * Buy chỉ có hình ảnh ở field: images
    * */

    BuyModel.findOne({_id: objectId}, (err, buy) => {
        if (err) {
            return callback(err);
        }

        if (!buy) {
            return callback(new Error('Buy not found: ' + objectId));
        }

        downloadAndResizeImages(buy.images, (err, finalUrls) => {
            if (err) {
                return logger.error("RICService::handleCaseBuy::error", err);
            }

            buy.images = finalUrls.filter(u => u !== null);
            buy.save((err) => {
                if (err) {
                    return logger.error(err.message);
                }

                logger.info('Resizing images success: ', finalUrls);
                return callback(null);
            });
        });
    });
};

const handleCaseProject = (objectId, callback) => {
    /*
    * Project có image ở các fields: introImages, overallSchema, groundImages, imageAlbums, projectProgressImages
    * */
    ProjectModel.findOne({_id: objectId}, (err, project) => {
        if (err) {
            return callback(err);
        }

        if (!project) {
            return callback(new Error('Project not found: ' + objectId));
        }

        const imageFields = ['introImages', 'overallSchema', 'groundImages', 'imageAlbums', 'projectProgressImages'];
        const results = {};

        async.each(imageFields, (field, cb) => {
            results[field] = [];
            const urls = project[field].map(img => img.id);

            downloadAndResizeImages(urls, (err, finalUrls) => {
                if (err) {
                    return cb(err);
                }

                results[field] = finalUrls;
                return cb(null);
            });
        }, (err) => {
            if (err) {
                return logger.error("RICService::handleCaseProject::error", err);
            }

            imageFields.forEach(field => {
                project[field] = removeNullIdImage(project[field], results[field]);
            });

            project.save();
            logger.info('Resizing images success');
            return callback(null);
        });
    });
};

const handleCaseNews = (objectId, callback) => {
    /*
    * News có hình ảnh ở: image
    * */
    NewsModel.findOne({_id: objectId}, (err, news) => {
        if (err) {
            return callback(err);
        }

        if (!news) {
            return callback(new Error('News not found: ' + objectId));
        }

        downloadAndResizeImages([news.image], (err, finalUrls) => {
            if (err) {
                return logger.error("RICService::handleCaseProject::handleCaseNews", err);
            }

            finalUrls = finalUrls.filter(u => u !== null);

            if (finalUrls.length !== 0) {
                news.image = finalUrls[0];
                news.save((err) => {
                    if (err) {
                        return logger.error(err.message);
                    }

                    logger.info('Resizing images success: ', finalUrls);
                    return callback(null);
                });
            }
        });
    });
};

const run = (obj, callback) => {
    logger.info('RICService::run is called with ', obj);

    switch (obj['target']) {
        case ricTypes.SALE:
            handleCaseSale(obj['objectId'], callback);
            break;
        case ricTypes.BUY:
            handleCaseBuy(obj['objectId'], callback);
            break;
        case ricTypes.PROJECT:
            handleCaseProject(obj['objectId'], callback);
            break;
        case ricTypes.NEWS:
            handleCaseNews(obj['objectId'], callback);
            break;
    }
};

module.exports = run;