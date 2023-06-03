export const connection = () => {
	// Conexión con base de datos remota NO CAMBIAR
	var graphenedbURL = process.env.GRAPHENEDB_BOLT_URL;
	var graphenedbUser = process.env.GRAPHENEDB_BOLT_USER;
	var graphenedbPass = process.env.GRAPHENEDB_BOLT_PASSWORD;

	console.log(graphenedbUser);

	/*
    Configuración de base de datos

    Hay 2 tipos de conexiones posibles:
        1. Conexion con base de datos local
        2. Conexion con base de datos del servidor
        
    Cuando se conecta la base de datos con localhost deben usarse los permisos mencionados en la siguiente estructura IF.
    No se debe cambiar nada de la estructura de configuración de la base de datos.
    */

	if(graphenedbURL == undefined){
		var driver = neo4j.driver('bolt://hobby-gbcebfemnffigbkefemgfaal.dbs.graphenedb.com:24786', 
			neo4j.auth.basic('app91002402-MWprOS', 'b.N1zF4KnI6xoa.Kt5xmDPgVvFuO0CG'), 
			{maxTransactionRetryTime: 60 * 1000});
	}else{
		var driver = neo4j.driver(graphenedbURL, neo4j.auth.basic(graphenedbUser, graphenedbPass), 
			{maxTransactionRetryTime: 60 * 1000});
	}

	return driver;
};
