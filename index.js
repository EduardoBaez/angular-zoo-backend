'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = process.env.PORT || 3333;


mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/zoo', { useMongoClient: true })
        .then(() => {
                console.log('CONEXION BD EXITOSA.');

                app.listen(port, () => {
                        console.log('SERVIDOR LOCAL CORRECTO.');
                });
        })
        .catch(err => console.log(err));