const express = require('express');
const router = express.Router();
const applicationController = require('../Controller/applicationController');
const { validateApplication, validateUpdateApplication } = require('../Middleware/applicationvalidator');

router.get('/applications/:id', applicationController.getApplicationById);
router.get('/applications', applicationController.getApplication);
router.post('/applications', validateApplication, applicationController.createApplication);
router.patch('/applications/:id', validateUpdateApplication, applicationController.updateApplication);
router.delete('/applications/:id', applicationController.deleteApplication);


module.exports = router;
