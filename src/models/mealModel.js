const dbCtrl = require("../ctrls/dbCtrl");

async function create(meal) {
    //create the meal
    const query = {
        text: "INSERT INTO comidas(nombre, horaComida, idElemento, tipoDia) values($1, $2, $3, $4) RETURNING idComida",
        values: [meal.nombre, meal.horaComida, meal.idElemento, meal.tipoDia]
    }
    const idMeal = (await dbCtrl.execute(query)).rows[0].idcomida;
    const ret = {
        idComida: idMeal,
    }
    return ret;

}

async function del(idComida) {
    const query = {
        text: "DELETE FROM comidas WHERE idComida = $1",
        values: [idComida]
    }
    await dbCtrl.execute(query);
}

async function update(newComida, idComida) {
    const query = {
        text: "UPDATE comidas SET nombre = $2 ,horaComida = $3 WHERE idComida = $1",
        values: [idComida, newComida.nombre, newComida.horaComida]
    }
    await dbCtrl.execute(query);
}

async function aliments(idComida) {
    const query = {
        text: "SELECT idAlimento, nombre, descripcion, calorias \
               FROM alimentos\
               WHERE idComida = $1 \
               ORDER BY idAlimento ASC",
        values: [idComida]
    }
    const res = (await dbCtrl.execute(query));
    const alimentsSet = [];
    for (let i=0; i<res.rows.length; ++i) {
        alimentsSet.push(res.rows[i]);
    }
    return alimentsSet;
}

async function importE(body) {
    console.log(body); /*
    let query = {
        text: "SELECT idActividad, nombre, descripcion, tiempoEjecucion\
               FROM actividades\
               WHERE idEntrenamiento = $1",
        values: [body.oldId]
    }
    let res = await dbCtrl.execute(query)
    console.log(res.rows);
    let res2;

    for (let i=0; i<res.rows.length; ++i) {
        query = {
            text: "SELECT numSets, numRepeticiones, tiempoDescanso, posicion\
                   FROM ejercicios\
                   WHERE idActividad = $1",
            values: [res.rows[i].idactividad]
        }
        res2 = await dbCtrl.execute(query);
        console.log(res2.rows);

        let exercise = {
            nombre: res.rows[i].nombre,
            descripcion: res.rows[i].descripcion,
            tiempoEjecucion: res.rows[i].tiempoejecucion,
            idEntrenamiento: body.newId,
            numSets: res2.rows[0].numsets,
            numRepeticiones: res2.rows[0].numrepeticiones,
            tiempoDescanso: res2.rows[0].tiempodescanso,
            posicion: res2.rows[0].posicion
        }

        await create(exercise);
    } */
    

}

module.exports = {
    create, del, update, aliments, importE
}
