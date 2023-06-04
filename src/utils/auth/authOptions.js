/* eslint-disable no-undef */

const refreshAuthOptionsFunction = (refresh_token, redirect_uri) => {
    let client_id = process.env.client_id ? process.env.client_id : secrets.client_id
    let secret = process.env.client_secret ? process.env.client_secret : secrets.secret

    /*Argumentos que usará el endpoint para establecer comunicación con Spotify*/
    return {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            refresh_token,
            redirect_uri,
            grant_type: 'refresh_token'
        },
        headers: {
            'Authorization': 'Basic ' + client_id + ':' + secret
        },
        json: true
    };
}

const authOptionsFunction = (code, redirect_uri) => {
    let client_id = process.env.client_id ? process.env.client_id : secrets.client_id
    let secret = process.env.client_secret ? process.env.client_secret : secrets.secret

    /*Argumentos que usará el endpoint para establecer comunicación con Spotify*/
    return {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code: code,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code'
        },
        headers: {
            'Authorization': 'Basic ' + client_id + ':' + secret
        },
        json: true
    };
}

module.exports = {
    refreshAuthOptionsFunction,
    authOptionsFunction,
}
