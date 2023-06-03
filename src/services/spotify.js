/* 
PROTOCOLO DE SEGURIDAD CON CLAVE SPOTIFY 

El protocolo de seguridad utiliza una llave la cual se encuentre en secret-config.json 
y por ningun motivo debe ser compartida con ninguna persona que no pertenezca al grupo de programadores de Atmos.
*/
export const configFile = () => {
	var fileName = './secret-config.json';
	var config;

	/*la siguiente estructura TRY configura la llave secreta y la manda a llamar en la variable config.*/
	try {
		config = require(fileName);
	}
	catch (err) {
		config = {};
		console.log('unable to read file \'' + fileName + '\': ', err);
		console.log('see secret-config-sample.json for an example');
	}

	console.log('session secret is:', config.sessionSecret);
	return config;
};
