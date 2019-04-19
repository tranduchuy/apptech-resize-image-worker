const sharp = require('sharp');
const multiparty = require('multiparty');
const config = require('config');
const fs = require('fs');
const HTTP_CODE = require('../../config/http-code.contants');
const {generateFolderTempByDate} = require('../utils/StringUtil');
const {makeFolders} = require('../utils/FolderUtil');
const ResizeService = require('../services/ResizeService');
const url = require('url');
const {deleteFiles} = require('../utils/FileUtil');
const log4js = require('log4js');
const logger = log4js.getLogger('Controllers');
const fileUtils = require('../utils/FileUtil');

const tempFolder = `${global.APP_DIR}/public/${config.get('tmpImgFolder')}`;

const uploadImage = async (req, res, next) => {
    logger.info('ResizeController::uploadImage is called');

    try {
        const form = new multiparty.Form();
        form.parse(req);

        form.on('file', async (name, file) => {
            const pathYMD = generateFolderTempByDate();

            const demoFolderPath = `${tempFolder}/demo/${pathYMD}`;
            const originalFolderPath = `${tempFolder}/original/${pathYMD}`;
            const fileName = fileUtils.uniqueid();

            const originalFilePath = `${originalFolderPath}/${fileName}`;
            const demoFilePath = `${demoFolderPath}/${fileName}`;

            makeFolders([demoFolderPath, originalFolderPath], async (err) => {
                if (err) {
                    logger.error('ResizeController::uploadImage::makeFolder error', err);
                    return next(err);
                }

                await fs.createReadStream(file.path).pipe(fs.createWriteStream(originalFilePath)); // save original file

                // resize to demo size
                const defaultSize = config.get('tempSize');
                sharp(file.path)
                    .resize(defaultSize.width, defaultSize.height)
                    .toFile(demoFilePath, (err) => {
                        if (err) {
                            logger.error('ResizeController::uploadImage sharp resize error', err);
                            return next(err);
                        }

                        logger.info('ResizeController::uploadImage::success');
                        return res.json({
                            status: HTTP_CODE.SUCCESS,
                            message: [],
                            data: {
                                link: `${pathYMD}/${fileName}`
                            }
                        });
                    });
            });
        });
    } catch (e) {
        logger.error('ResizeController::uploadImage error', err);
        return next(err);
    }
};

const confirmAndResize = async (req, res, next) => {
    logger.info('ResizeController::confirmAndResize is called');
    try {
        let {paths} = req.body;

        paths = paths.map(p => {
            if (p.indexOf('http') !== -1) {
                const tmpUrl = new url(p);
                return tmpUrl.p;
            }

            return p;
        });

        const sourceDemoFilePaths = paths.map(p => {
            return `${tempFolder}/demo/${p}`
        });

        const sourceOriginalFilePath = paths.map(p => {
            return `${tempFolder}/original/${p}`
        });

        ResizeService.resizeMultipleImage(sourceOriginalFilePath, 'using', (err, results) => {
            if (err) {
                logger.error('ResizeController::confirmAndResize::error', err);
                return next(err);
            }

            const filesToDelete = [...sourceDemoFilePaths, ...sourceOriginalFilePath];

            deleteFiles(filesToDelete, (err) => {
                if (err) {
                    logger.warn('Remove file error', err);
                    logger.warn('Error on ', filesToDelete.join('\n'));
                }
            });

            return res.json({
                status: HTTP_CODE.SUCCESS,
                message: ['Success'],
                data: {
                    links: results
                }
            });
        });

    } catch (e) {
        logger.error('ResizeController::confirmAndResize::error', e);
        return next(e);
    }
};

const updateAndResize = (req, res, next) => {
    logger.info('ResizeController::updateAndResize is called');
    try {
        let {oldImages, newImages} = req.body;

        ResizeService.removeOldImages(oldImages, (err) => {
            if (err) {
                logger.warn('Remove old file errors: ', err);
                logger.warn('Error on ', oldImages.join('\n'));
            }
        });

        // check new image exists for using resize
        let notExistsFiles = ResizeService.checkOriginalImageExist(newImages);
        if (notExistsFiles.length !== 0) {
            logger.error('ResizeController::updateAndResize::error: Some new files are not exits');
            return res.json({
                status: HTTP_CODE.ERROR,
                message: ['Some new files are not exits'],
                data: {
                    links: notExistsFiles
                }
            });
        }

        const sourceOriginalFilePath = newImages.map(p => {
            return `${tempFolder}/original/${p}`
        });

        ResizeService.resizeMultipleImage(sourceOriginalFilePath, 'using', (err, results) => {
            if (err) {
                return next(err);
            }

            deleteFiles(sourceOriginalFilePath, (err) => {
                if (err) {
                    logger.warn('Remove file error', err);
                    logger.warn('Error on ', sourceOriginalFilePath.join('\n'));
                }
            });

            logger.info('ResizeController::updateAndResize::success');
            return res.json({
                status: HTTP_CODE.SUCCESS,
                message: ['Success'],
                data: {
                    links: results
                }
            });
        });
    } catch (e) {
        logger.error('ResizeController::updateAndResize::error', e);
        return next(e);
    }
};

module.exports = {
    uploadImage,
    confirmAndResize,
    updateAndResize
};