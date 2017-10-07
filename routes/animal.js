'use strict'

var express = require('express');
var AnimalController = require('../controllers/animal');

var api = express.Router();
var md_auth = require('../middlewares/authenticated');
var md_admin = require('../middlewares/is_admin');

var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './uploads/animals'});

api.get('/pruebas-animal', md_auth.ensureAuth, AnimalController.prueba);
api.post('/save-animal', [md_auth.ensureAuth, md_admin.isAdmin], AnimalController.saveAnimal);
api.get('/list-animals', AnimalController.getAnimals);
api.get('/list-animal/:id', AnimalController.getAnimal);
api.put('/update-animal/:id', [md_auth.ensureAuth, md_admin.isAdmin], AnimalController.updateAnimal);
api.post('/upload-image-animal/:id', [md_auth.ensureAuth, md_admin.isAdmin, md_upload], AnimalController.uploadImage);
api.get('/get-image-animal/:imageFile', AnimalController.getImageFile );
api.delete('/delete-animal/:id', [md_auth.ensureAuth, md_admin.isAdmin], AnimalController.deleteAnimal);

module.exports = api;