/*
    Este proceso funciona para crear una llave de acceso a la API de SPOTIFY
    
    La llave enviada a la API será comparada con la que se reciba después del proceso y estas deberán coincidir para no generar un error.

 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
*/

const generateRandomStringCode = (length) => {
    var text = '';
    var possible = 'abcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

module.exports = generateRandomStringCode;
