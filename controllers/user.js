'use strict'

// Modulos
var bcrypt = require('bcrypt-nodejs');
var fs = require('fs');
var path = require('path');

// Modelos
var User = require('../models/user');

// Servicio JWT
var jwt = require('../services/jwt');

// Metodos
function prueba(req, res) {
    res.status(200).send({
        message: 'Probando Controlador de usuarios y metodo Prueba'
    });
}

function saveUser(req, res) {
    // Crear el objecto usuario
    var user = new User();

    // Recoger parametros del body de la petición
    var params = req.body;

    if(params.password && params.name && params.surname && params.email){
        // Asignar valores al objeto usuario
        user.name = params.name;
        user.surname = params.surname;
        user.email = params.email;
        user.role = 'ROLE_USER';
        user.image = null;

        User.findOne({email: user.email.toLowerCase()}, (err, issetUser) => {
            if(err){
                res.status(500).send({message: 'Error al validar usuario'});
            }else{
                if(!issetUser){
                    // Cifrar la contraseña
                    bcrypt.hash(params.password, null, null, function(err, hash){
                        user.password = hash;

                        // Guardar usuario en bd
                        user.save((err, userGuardado) => {
                            if(err){
                                res.status(500).send({message: 'Error al guardar usuario'});
                            }else{
                                if(!userGuardado){
                                    res.status(404).send({message: 'No se ha registrado el usuario'});
                                }else{
                                    res.status(200).send({user: userGuardado});
                                }
                            }
                        });
                    });
                }else{
                    res.status(200).send({message: 'El usuario ya existe'});
                }
            }
        });

    }else{
        res.status(200).send({message: 'Datos incorrectos, ingresa todos los parametros para registrar usuario'});
    }
}

function login(req, res){
    var params = req.body;

    var email = params.email;
    var password = params.password;

    User.findOne({email: email.toLowerCase()}, (err, user) => {
        if(err){
            res.status(500).send({message: 'Error al validar usuario'});
        }else{
            if(user){
                bcrypt.compare(password, user.password, (err, check) => {
                    if(check){
                        if(params.gettoken){
                            res.status(200).send({token: jwt.createToken(user)});
                        }else{
                            res.status(200).send({user});
                        }
                    }else{
                        res.status(404).send({message: 'Contraseña invalida'});
                    }
                });
            }else{
                res.status(404).send({message: 'Usuario no existe'})
            }
        }
    });
}

function updateUser(req, res){
    var userId = req.params.id;
    var update = req.body;
    delete update.password;

    if(userId != req.user.sub){
        return res.status(500).send({message: 'No tienes permiso para actualizar usuario'});
    }

    User.findByIdAndUpdate(userId, update, {new:true}, (err, userActualizado) => {
        if(err){
            res.status(500).send({message: 'Error al actualizar usuario'});
        }else{
            if(!userActualizado){
                res.status(404).send({message: 'No se ha podido actualizar el usuario'});
            }else{
                res.status(200).send({user: userActualizado});
            }
        }
    });
}

function uploadImage(req, res){
    var userId = req.params.id;
    var file_name = 'No subido...';

    if(req.files){
        var file_path = req.files.image.path;
        var file_split = file_path.split('\\');
        var file_name = file_split[2];

        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){
            if(userId != req.user.sub){
                return res.status(500).send({message: 'No tienes permiso para actualizar usuario'});
            }
        
            User.findByIdAndUpdate(userId, {image: file_name}, {new:true}, (err, userActualizado) => {
                if(err){
                    res.status(500).send({message: 'Error al actualizar usuario'});
                }else{
                    if(!userActualizado){
                        res.status(404).send({message: 'No se ha podido actualizar el usuario'});
                    }else{
                        res.status(200).send({user: userActualizado, image: file_name});
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
    var path_file = './uploads/users/'+imageFile;

    fs.exists(path_file, function(exists){
        if(exists){
            res.sendFile(path.resolve(path_file));
        }else{
            res.status(404).send({message: 'La imagen no existe'});
        }
    });
}

function getKeepers(req, res){
    User.find({role: 'ROLE_ADMIN'}).exec((err, users) => {
        if(err){
            res.status(500).send({message: 'Error al obtener cuidadores'});
        }else{
            if(users == false){
                res.status(404).send({message: 'No existen cuidadores'});
            }else{
                res.status(200).send({users});
            }
        }
    });
}

module.exports = {
    prueba,
    saveUser,
    login,
    updateUser,
    uploadImage,
    getImageFile,
    getKeepers
};