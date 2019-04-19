global.APP_DIR = __dirname;

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const filemanager = require("rich-filemanager-node");

const indexRouter = require('./src/routes/index');
const resizeRouter = require('./src/routes/Resize.Router');
const { ERROR } = require('./config/http-code.contants');

const app = express();
const log4js = require('log4js');
log4js.configure('./config/log4js.json');
log4js.setGlobalLogLevel(log4js.levels.DEBUG);

require('./src/services/RabbitMQService')(); // start rabbitMQ

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');



app.use(cors());
app.use('/filemanager', filemanager(`${global.APP_DIR}/public`, `${global.APP_DIR}/config/filemanager.config.json`));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);
app.use('/images', resizeRouter);

// catch unsupported api
app.use(function(req, res, next) {
  next(new Error("Unsupported api"));
});

// error handler
app.use(function(err, req, res, next) {
  return res.json({
    status: ERROR,
    message: [
      err.stack
    ],
    data: {}
  });
});

module.exports = app;
