/* eslint-disable no-undef */

const refreshAuthOptionsFunction = (refresh_token, redirect_uri) => {
    /*Argumentos que usará el endpoint para establecer comunicación con Spotify*/
    return {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            refresh_token,
            redirect_uri,
            grant_type: 'refresh_token'
        },
        headers: {
            'Authorization': 'Basic ' + secrets.client_id + ':' + secrets.secret
        },
        json: true
    };
}

const authOptionsFunction = (code, redirect_uri) => {
    /*Argumentos que usará el endpoint para establecer comunicación con Spotify*/
    return {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code: code,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code'
        },
        headers: {
            'Authorization': 'Basic ' + secrets.client_id + ':' + secrets.secret
        },
        json: true
    };
}

module.exports = {
    refreshAuthOptionsFunction,
    authOptionsFunction,
}
