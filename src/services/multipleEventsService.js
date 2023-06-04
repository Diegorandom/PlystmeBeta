const multiplesEvents = (codigoBD) => {
    //console.log(codigoBD.records[0]._fields)

    var listaEventos = [];
    codigoBD.records.forEach(function (item) {
        listaEventos.push(item._fields)

        if (codigoBD.records.length == listaEventos.length) {

            //listaEventos -> [codigo, nombre de host, ...]
            return {
                event: 'multiplesEventos',
                listaEventos
            }
        }

    })

}

module.exports = multiplesEvents