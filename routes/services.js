const express = require('express');
const router = express.Router();

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const servCtrl = require('../controllers/serviceController');

// middleware for token auth
router.use(tokenMiddleware);

// middleware to reject invalid services
function rejectInvalid(req, res, next) {
  const validTypes = [ 'SOAP', 'REST', 'MQ' ];

  const type = req.body.type;
  if (type && validTypes.includes(type)) return next();
  
  handleError(`Service type ${type} is not supported`, res, 400);
}

//Upload zip in upload directory and extract the zip in RRPair directory
router.post('/fromPairs/upload', upload.single('zipFile'), servCtrl.zipUploadAndExtract);

//create service from RR Pairs present in RRPair directory
router.post('/fromPairs/publish', servCtrl.publishExtractedRRPairs);

//Upload openapi or wsdl spec in upload directory.
router.post('/fromSpec/upload', upload.single('specFile'), servCtrl.specUpload);

//create openapi or wsdl service from open spec or wsdl present in upload directory
router.post('/fromSpec/publish', servCtrl.publishUploadedSpec);

// retrieve archive services
router.get('/archive', servCtrl.getArchiveServices);

//delete a virtual service from Archive
router.delete('/archive/:id', servCtrl.permanentDeleteService);

// restore a virtual service from Archive
router.post('/archive/:id/restore', servCtrl.restoreService);

// get Service Info for a virtual service from Archive
router.get('/archive/:id', servCtrl.getArchiveServiceInfo);

// add a new virtual service
router.post('/', rejectInvalid, servCtrl.addService);

//Search services
router.get("/search/:id",servCtrl.searchServices);
router.get("/search",servCtrl.searchServices);

// retrieve a virtual service by ID (in JSON)
router.get('/:id', servCtrl.getServiceById);

// retrieve services with query string filters
router.get('/', servCtrl.getServicesByQuery);

// retrieve services by SUT
router.get('/sut/:name', servCtrl.getServicesBySystem);

// retrieve services by SUT Archive
router.get('/sut/:name/archive', servCtrl.getServicesArchiveBySystem);

// retrieve services by user
router.get('/user/:uid', servCtrl.getServicesByUser);

// retrieve services by user Archive
router.get('/user/:uid/archive', servCtrl.getArchiveServicesByUser);

// update a virtual service by ID
router.put('/:id', servCtrl.updateService);

// delete a virtual service by ID
router.delete('/:id', servCtrl.deleteService);

// toggle a service on / off TODO: toggle MQ services
router.post('/:id/toggle', servCtrl.toggleService);




const rrpairs = require('./rrpairs');
router.use(rrpairs);

module.exports = router;