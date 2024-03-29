![alt text](https://github.com/Diegorandom/PlystmeBeta/blob/master/plystmeLogin.png)

# Arquitectura de Plystme

Actualmente éste repo de plystme contiene la API que orquestra el sistema. La interfaz tendrá lugar en otro repositorio si se llega a crear de nuevo.
En el pasado Plystme tuvo una arquitectura servidor-cliente conectada con la API de Spotify, la API del algoritmo de recomendaciones y la base de datos Neo4j. El frontEnd fue construído en su totalidad sobre JavaScript con un templating language de Node.js llamado EJS. 

La comunicación entre el cliente y el backend utiliza HTTP con Ajax para la autenticación con la API de Spotify y para servir datos estáticos como lo son el mapa de características de la música que escucha el usuario así como datos que se obtienen de eventos detonados desde el cliente como los son las listas del Top 50 de música que escucha el usuario. 

Socket.io se utiliza en la comunicación cliente-servidor para la creación y administración en tiempo real de las playlists grupales a las cuales se accede con el uso de un código dado por el anfitrión a los invitados de la fiesta.

## Refactor Sucediendo | Ongoing Refactor

Lo que ha sucedido:
- Se rompió el monolito
- Mejor separación de responsabilidad
- Se actualizaron librerías deprecadas
- Se agregó linter
- Se agregó sonarcloud
- Log In con Spotify actualizada
- Fingerprint Signal/Data Collection via Spotify actualizada
- Test conexión de base de datos actualizada
- Servidor corriendo en local
- Separar la interfaz de usuario del API

Lo que falta:
- Tests unitarios
- Servidor corriendo en un ambiente de producción
- Documentación

## Configuración de base de datos

Hay 2 tipos de conexiones posibles:
- 1. Conexion con base de datos local
- 2. Conexion con base de datos del servidor

## Caso de uso de Servicio Principal de Plystme

El servicio principal de Plystme permite que usuarios tomen el rol de anfitriones al crear una playlist grupal. Una vez hecho esto, pueden compartir el código de la playlist grupal con otros usuarios que tomarán el rol de invitados para que estos se unan a la playlist. Cada vez que un nuevo invitado se une a una playlist, un evento detonado por socket.io deberá mandar a llamar la API de recomendaciones para que generé una nueva playlist con recomendaciones para el grupo de personas que se encuentren actualmente en la playlist grupal creada en plystme.com

## Algoritmo de Recomendaciones

El algoritmo de recomendaciones extrae de la base de datos los el conjunto de nodos que contienen toda la música que se puede analizar de cada uno de los usuarios dentro de la playlist grupal.

Una vez extraída la información de cada usuario, se obtienen las características promedio del grupo y se crea una póliza que identifica las características ideales de la música a recomendar. Hecho esto, el algoritmo seleccionará 50 canciones dentro del universo de música que escuchan los usuarios dentro del playlist grupal. Esta playlist entonces estará disponible para su descarga en Plystme y para su stream en Spotify.

## Modelo de Base de Datos con Neo4j

La base de datos está siendo implementada con Neo4j, una tecnología de bases de datos gráficas que funciona con nodos y aristas. La información del usuario se almacena en una estructura con 3 diferentes capas.

## Estructura de información del usuario

- Existen nodos que corresponde al usuario y contiene información personal del usuario como email y username. 
- Existen nodos que corresponden a la música que se tiene registro que el usuario ha escuchado. 
- Existen nodos que representan a los artistas que interpretan la música que escucha el usuario. 

[Info.](https://medium.com/@diegoignacioortega/motor-de-recomendación-de-música-basado-en-grafos-f4e02de2884e)

## Estructura de eventos y usuarios

- Se pueden identificar grupos de usuarios que generan varios eventos entre ellos mismos. 
- Usuarios que han generado varios eventos con diferentes personas
- Las redes sociales que pueden relacionar diferentes grupos de personas.

POR SURIEL DAVID GARCÍA, DIEGO IGNACIO ORTEGA, ALEXIS DESTRUÍDO Y DAVID BARRIENTOS
