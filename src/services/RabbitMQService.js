const log4js = require('log4js');
const logger = log4js.getLogger('Services');
const amqp = require('amqplib/callback_api');
const mqEvents = require('../constants/rabbitmq-events');
const config = require('config');
const ricService = require('./RICService');

const rabbitMQConfig = config.get('rabbitmq');

const getConnectStr = () => {
    return `amqp://${rabbitMQConfig.username}:${rabbitMQConfig.password}@${rabbitMQConfig.host}:${rabbitMQConfig.port}/`;
};

// RIC = Resize image for crawler
const handleMessageRIC = (channel, msg) => {
    const messageStr = msg.content.toString();

    try {
        const obj = JSON.parse(messageStr);

        if (!obj['target'] || !obj['objectId']) {
            return logger.error('RabbitMQService::handleMessageRIC::error invalid obj. Should contain target and objectId');
        }

        ricService(obj, (err) => {
            if (err) {
                return logger.error('RabbitMQService::handleMessageRIC::error', err);
            }

            channel.ack(msg); // acknowledgment
            return logger.info('RabbitMQService::handleMessageRIC::success', messageStr);
        });
    } catch (e) {
        logger.error('RabbitMQService::handleMessageRIC::error cannot parse json', e);
    }
};

const createChannelResizeImageForCrawler = (conn) => {
    logger.info('RabbitMQService::createChannelResizeImageForCrawler');
    const queueName = mqEvents.RESIZE_IMAGES_FOR_CRAWLER2;

    conn.createChannel(function (err, channel) {
        if (err) {
            return logger.error('RabbitMQService::createChannelResizeImageForCrawler:error', err);
        }

        channel.assertQueue(queueName, {durable: true});
        channel.consume(queueName, (msg) => {
            handleMessageRIC(channel, msg);
        }, {noAck: false});
    });
};

const init = () => {
    const connectStr = getConnectStr();
    logger.info('RabbitMQService::init is called', connectStr);

    amqp.connect(connectStr, function (err, conn) {
        if (err) {
            return logger.error('RabbitMQService::init::error', err);
        }

        createChannelResizeImageForCrawler(conn);
    });
};

module.exports = init;