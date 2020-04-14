const assert = require("assert");

const user = require("../src/models/userModel");
const diet = require("../src/models/dietModel");
const dbCtrl = require("../src/ctrls/dbCtrl");
const meal = require("../src/models/mealModel");

require("./rootHooks");

describe("mealModel script", function() {
    describe("create function", function() {
        it("should return meal created correctly", async function() {
            //create user
            let newUser = {
                nombre: "Oriol",
                password: "hash",
                email: "oriol@example.com",
            }
            await user.create(newUser);
            
            //select id from user in order to create a diet (we need it for the foreign key of element)
            let query = {
                text: "SELECT id \
                        FROM usuarios \
                        WHERE nombre = $1",
                values: ["Oriol"],
            };
            let res = (await dbCtrl.execute(query)).rows[0];
            idTest = res.id; 

            //create diet (and element)
            let newDiet = {
                nombre: "DietTest",
                descripcion: "DietDescription",
                idUser: idTest,
            }
            idDiet = await diet.create(newDiet);

            //get the automatically generated id for the diet in order to access it
            let queryGetID = {
                text: "SELECT idElemento \
                        FROM elementos \
                        WHERE nombre = $1 and idUsuario = $2",
                values: [newDiet.nombre, idTest],
            };
            res = (await dbCtrl.execute(queryGetID)).rows[0];
            idElem = res.idelemento;

            //create a meal
            let newMeal = {
                nombre: "MealTest",
                horaComida: '22:00:00',
                idElemento: idElem,
                tipoDia: "miercoles",
            };

            idMeal = (await meal.create(newMeal)).rows[0].idcomida;

            //make sure it really is the meal we created
            query = {
                text: "SELECT nombre, horaComida, idElemento, tipoDia \
                        FROM comidas \
                        WHERE idComida = $1",
                values: [idMeal],
            };
            res = (await dbCtrl.execute(query)).rows[0];
            assert.equal(newMeal.nombre, res.nombre);            
            assert.equal(newMeal.horaComida, res.horacomida);
            assert.equal(newMeal.idElemento, res.idelemento);
            assert.equal(newMeal.tipoDia, res.tipodia);

        });
    });

    describe("delete function", function() {        
        it("should return meal deleted correctly", async function() {
            //create user
            let newUser = {
                nombre: "Oriol",
                password: "hash",
                email: "oriol@example.com",
            }
            await user.create(newUser);

            //select id from user in order to create a diet (we need it for the foreign key of element)
            let query = {
                text: "SELECT id \
                        FROM usuarios \
                        WHERE nombre = $1",
                values: ["Oriol"],
            };
            let res = (await dbCtrl.execute(query)).rows[0];
            idTest = res.id; 

            //create diet (and element)
            let newDiet = {
                nombre: "DietTest",
                descripcion: "DietDescription",
                idUser: idTest,
            }
            await diet.create(newDiet);

            //get the automatically generated id for the diet in order to create a meal
            let queryGetID = {
                text: "SELECT idElemento \
                        FROM elementos \
                        WHERE nombre = $1 and idUsuario = $2",
                values: [newDiet.nombre, idTest],
            };
            res = (await dbCtrl.execute(queryGetID)).rows[0];
            idElem = res.idelemento;

            //create a meal
            let newMeal = {
                nombre: "MealTest",
                horaComida: '22:00:00',
                idElemento: idElem,
                tipoDia: "miercoles",
            };
            idMeal = (await meal.create(newMeal)).rows[0].idcomida;

            //deletion of the meal
            await meal.del(idMeal);

            //making sure the meal does not exist
            query = {
                text: "SELECT * \
                        FROM comidas" ,
            };
            res = (await dbCtrl.execute(query)).rows;
            assert.equal(res.length, 0);
        });
    });

    describe("update function", function() {        
        it("should return diet update correctly", async function() {

            //create user
            let newUser = {
                nombre: "Oriol",
                password: "hash",
                email: "oriol@example.com",
            }
            await user.create(newUser);

            //select id from user in order to create a diet (we need it for the foreign key of element)
            let query = {
                text: "SELECT id \
                        FROM usuarios \
                        WHERE nombre = $1",
                values: ["Oriol"],
            };
            let res = (await dbCtrl.execute(query)).rows[0];
            idTest = res.id; 

            //create diet (and element)
            let newDiet = {
                nombre: "DietTest",
                descripcion: "DietTest",
                idUser: idTest,
            }
            await diet.create(newDiet);
            

            //get the automatically generated id for the diet in order to create a meal
            let queryGetID = {
                text: "SELECT idElemento \
                        FROM elementos \
                        WHERE nombre = $1 and idUsuario = $2",
                values: [newDiet.nombre, idTest],
            };
            res = (await dbCtrl.execute(queryGetID)).rows[0];
            idElem = res.idelemento;

            //create a meal
            let newMeal = {
                nombre: "MealTest",
                horaComida: '22:00:00',
                idElemento: idElem,
                tipoDia: "miercoles",
            };
            idMeal = (await meal.create(newMeal)).rows[0].idcomida;


            let modifiedMeal = {
                nombre: "MealTest2",
                descripcion: "MealTest2",
            }

            //update diet
            await meal.update(modifiedMeal, idMeal);

            //get the modified meal
            query = {
                text: "SELECT nombre, horaComida \
                        FROM comidas \
                        WHERE idComida = $1",
                values: [idMeal],
            };
            res = (await dbCtrl.execute(query)).rows[0];    

            //make sure the modifications have been made
            assert.equal(modifiedMeal.nombre, res.nombre);
            assert.equal(modifiedMeal.horaComida, res.horacomida);
        });
    });
});