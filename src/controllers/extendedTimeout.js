var express = require("express");
var bodyParser = require('body-parser');
var methodOverride = require('method-override')
var logger = require('morgan');
var path = require('path');
var cookieParser = require('cookie-parser');
var app = express();

//CONFIGURACIÓN DE MÓDULOS INTERNOS DE EXPRESS
app.use(logger('dev'));
app.use(bodyParser.json()); //DECLARACION DE PROTOCOLO DE LECTURA DE LAS VARIABLES INTERNAS "BODY" DE LAS FUNCIONES 
app.use(bodyParser.urlencoded({ extended: true })); //DECLARACIÓN DE ENCODER DE URL
// eslint-disable-next-line no-undef
app.use(express.static(path.join(__dirname, 'public'))); //DECLARA PATH HACIA PUBLIC BY DEFAULT PARA LOS RECURSOS
app.use(cookieParser());
app.use(methodOverride());

/*PIEZA DE MIDDLEWARE QUE NO SE ESTÁ USANDO*/