var express = require("express");
var router = new express.Router();
const valorNulo = require('../utils/valorNulo')

/*Se ejecuta la ruta del perfil para renderizarlo*/
router.get('/perfil', function (request, response, error) {
    var objetosGlobales = request.app.get('objetosGlobales');
    var position = request.app.get('position');
    position = request.sessions.position;

    console.log('Entró a perfil')

    console.log('objetosGlobales ', objetosGlobales);

    // response.setHeader("Pragma", "no-cache");
    // response.setHeader("Cache-Control", "no-store");

    /*Algunas configuraciones*/
    objetosGlobales[position].ref = false;

    console.log('apuntador del arreglo', position)

    objetosGlobales[position].usuarios = [];
    /*Esta parte guarda a los usuarios dentro del pool en la variable usuarios para que sean desplegados en la interfaz*/

    if (position != 0 && objetosGlobales[position] != null) {

        /*Esta parte filtra a los usuarios repetidos en el sistema de perfil. Ya sea porque están adentro de diferentes perfiles o por cualquier otra razón que dupliqué un usuario*/

        /*Filtrado de usuarios repetidos*/
        var repetido = false

        if (objetosGlobales[position].usuarios.length == 0) {
            console.log('El primer usuario se guarda solo')
            if (objetosGlobales[position].nombre == undefined && objetosGlobales[position].userid != undefined) {
                objetosGlobales[position].nombre = objetosGlobales[position].userid
                objetosGlobales[position].usuarios[position - 1] = [objetosGlobales[position].nombre, objetosGlobales[position].imagen_url]
            } else if (objetosGlobales[position].nombre != undefined) {
                objetosGlobales[position].usuarios[position - 1] = [objetosGlobales[position].nombre, objetosGlobales[position].imagen_url]
            }

        } else {
            console.log("usuarios ->", objetosGlobales[position].usuarios)
            objetosGlobales[position].usuarios.forEach(function (valorComparador, indice) {
                console.log('Ejecutando funcion OnlyUnique')
                if (objetosGlobales[position].nombre != undefined && valorComparador[0] != undefined) {
                    console.log('Los valores NO son Nulos')
                    if (objetosGlobales[position].nombre.toString() == valorComparador[0].toString()) {
                        console.log('valor Repetido')
                        repetido = true
                    } else if ((indice + 1 == objetosGlobales[position].usuarios.length) && repetido == false) {
                        console.log('valor nuevo -> ', objetosGlobales[position].nombre)
                        objetosGlobales[position].usuarios[position - 1] = [objetosGlobales[position].nombre, objetosGlobales[position].imagen_url]
                    }
                } else {
                    console.log('Los valores son Nulos')
                    if (objetosGlobales[position].nombre == undefined) {
                        objetosGlobales[position].nombre = objetosGlobales[position].userid
                        if (objetosGlobales[position].nombre.toString() == valorComparador[0].toString()) {
                            console.log('valor Repetido')
                            repetido = true
                        } else if ((indice + 1 == objetosGlobales[position].usuarios.length) && repetido == false) {
                            console.log('valor nuevo -> ', objetosGlobales[position].nombre)
                            objetosGlobales[position].usuarios[position - 1] = [objetosGlobales[position].nombre, objetosGlobales[position].imagen_url]
                        }
                    }
                }
            })
        }

        if (objetosGlobales.length == position + 1) {
            objetosGlobales[position].usuarios = objetosGlobales[position].usuarios.filter(valorNulo)
            console.log('USUARIOS EN EL POOL GLOBAL')
            console.log(objetosGlobales[position].usuarios)

            if (objetosGlobales[position].cambioRango == true) {
                //console.log("Objetos Globales del Usuario -> ",  objetosGlobales[position] )
                console.log('Cambio de rango')
                objetosGlobales[position].cambioRango = false;
                console.log('Regreso a estado original de cambioRango -> ', objetosGlobales[position].cambioRango)

                response.send(objetosGlobales[position].seedTracks)
            } else if (objetosGlobales[position].refreshing == true) {
                console.log('Refrescando Tokens')
                objetosGlobales[position].refreshing = false;
                response.send("TOKEN REFRESCADO")
                //console.log("Objetos Globales del Usuario -> ",  objetosGlobales[position] )
            } else if (objetosGlobales[position].refreshingUsers == true) {
                console.log('Refrescando usuarios en el pool')
                console.log(objetosGlobales[position].usuarios)
                objetosGlobales[position].refreshingUsers = false
                response.send(objetosGlobales[position].usuarios)
                //console.log("Objetos Globales del Usuario -> ",  objetosGlobales[position] )
            } else {
                console.log('Cargando perfil')
                response.render('../views/pages/perfilUI.ejs', objetosGlobales[position])
            }

        }
    }

});

//Finaliza proceso
module.exports = router;