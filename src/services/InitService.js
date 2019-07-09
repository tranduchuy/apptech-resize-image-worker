const fs = require("fs");

if (!fs.existsSync(global.APP_DIR + '/logs')) {
    console.warn('Not found folder logs');
    fs.mkdirSync(global.APP_DIR + '/logs');
}