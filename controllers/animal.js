'use strict'

// Modulos
var fs = require('fs');
var path = require('path');

// Modelos
var User = require('../models/user');
var Animal = require('../models/animal.js')

// Metodos
function prueba(req, res) {
    res.status(200).send({
        message: 'Probando Controlador de animales y metodo Prueba',
        user: req.user
    });
}

function saveAnimal(req, res){
    // Crear objeto animal
    var animal = new Animal();

    // Recoger parametros de la request
    var params = req.body;

    if(params.name){
        animal.name = params.name;
        animal.description = params.description;
        animal.year = params.year;
        animal.image = null;
        animal.user = req.user.sub;

        animal.save((err, animalGuardado) => {
            if(err){
                res.status(500).send({message: 'Error al guardar Animal'});
            }else{
                if(!animalGuardado){
                    res.status(404).send({message: 'No se ha podido guardar el animal'});
                }else{
                    res.status(200).send({animal: animalGuardado});
                }
            }
        })

    }else{
        res.status(404).send({message: 'Debes ingresar el nombre del animal'});
    }
}

function getAnimals(req, res){
    Animal.find({}).populate({path: 'user'}).exec((err, animals) => {
        if(err){
            res.status(500).send({message: 'Error al listar Animales'});
        }else{
            if(animals == false){
                res.status(404).send({message: 'No hay animales para listar'});
            }else{
                res.status(200).send({animals});
            }
        }
    });
}

function getAnimal(req, res){
    var animalId = req.params.id;

    Animal.findById(animalId).populate({path: 'user'}).exec((err, animal) =>{
        if(err){
            res.status(500).send({message: 'Error al listar Animal'});
        }else{
            if(animal == false){
                res.status(404).send({message: 'No hay animal para listar'});
            }else{
                res.status(200).send({animal});
            }
        }
    });
}

function updateAnimal(req, res){
    var animalId = req.params.id;
    var updtate = req.body;

    Animal.findByIdAndUpdate(animalId, updtate, {new:true}, (err, animalActualizado) => {
        if(err){
            res.status(500).send({message: 'Error al actualizar Animal'});
        }else{
            if(!animalActualizado){
                res.status(404).send({message: 'No se pudo actualizar Animal'});
            }else{
                res.status(200).send({animal: animalActualizado});
            }
        }
    });
}

function uploadImage(req, res){
    var animalId = req.params.id;
    var file_name = 'No subido...';

    if(req.files){
        var file_path = req.files.image.path;
        var file_split = file_path.split('\\');
        var file_name = file_split[2];

        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){
        
            Animal.findByIdAndUpdate(animalId, {image: file_name}, {new:true}, (err, animalActualizado) => {
                if(err){
                    res.status(500).send({message: 'Error al actualizar animal'});
                }else{
                    if(!animalActualizado){
                        res.status(404).send({message: 'No se ha podido actualizar el animal'});
                    }else{
                        res.status(200).send({animal: animalActualizado, image: file_name});
                    }
                }
            });
        }else{
            fs.unlink(file_path, (err) => {
                if(err){
                    res.status(200).send({message: 'Extensión no valida y fichero no borrado'});
                }else{
                    res.status(200).send({message: 'Extensión no valida'});
                }
            }); 
        }
    }else{
        res.status(200).send({message: 'No se han subido archivos'});
    }
}

function getImageFile(req, res){
    var imageFile = req.params.imageFile;
    var path_file = './uploads/animals/'+imageFile;

    fs.exists(path_file, function(exists){
        if(exists){
            res.sendFile(path.resolve(path_file));
        }else{
            res.status(404).send({message: 'La imagen no existe'});
        }
    });
}

function deleteAnimal(req, res){
    var animalId = req.params.id;

    Animal.findByIdAndRemove(animalId, (err, animalBorrado) => {
        if(err){
            res.status(500).send({message: 'Error al eliminar Animal'});
        }else{
            if(!animalBorrado){
                res.status(404).send({message: 'No se ha podido eliminar el Animal'});
            }else{
                res.status(200).send({animal: animalBorrado});
            }
        }
    });
}

module.exports = {
    prueba,
    saveAnimal,
    getAnimals,
    getAnimal,
    updateAnimal,
    uploadImage,
    getImageFile,
    deleteAnimal
};