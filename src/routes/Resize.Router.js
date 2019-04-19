const express = require('express');
const router = express.Router({});
const ResizeController = require('../controllers/ResizeController');


// upload
router.post('/', ResizeController.uploadImage);

// confirm and resize image
router.post('/confirmation', ResizeController.confirmAndResize);

// update and resize image
router.put('/confirmation', ResizeController.updateAndResize);

module.exports = router;
