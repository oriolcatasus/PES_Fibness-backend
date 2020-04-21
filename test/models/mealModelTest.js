const assert = require("assert");

const user = require("../../src/models/userModel");
const diet = require("../../src/models/dietModel");
const dbCtrl = require("../../src/ctrls/dbCtrl");
const meal = require("../../src/models/mealModel");
const aliment = require("../../src/models/alimentModel");

require("../rootHooks");

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

            idMeal = (await meal.create(newMeal)).idComida;

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
            idMeal = (await meal.create(newMeal)).idComida;

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
            idMeal = (await meal.create(newMeal)).idComida;


            let modifiedMeal = {
                nombre: "MealTest2",
                horaComida: "10:00:00",
            }

            //update meal
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
    describe("get operation", function() {
        it("should return set of aliments correctly", async function() {
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
            idMeal = (await meal.create(newMeal)).idComida;

            //create an aliment
            let newAliment = {
                nombre: "AlimentTest",
                descripcion: "descriptionTest2",
                calorias: '100',
                idComida: idMeal,
            };
            await aliment.create(newAliment);

            //create an aliment 2
            let newAliment2 = {
                nombre: "AlimentTest2",
                descripcion: "descriptionTest2",
                calorias: '500',
                idComida: idMeal,
            };
            await aliment.create(newAliment2)

            let alimentSet = await meal.aliments(idMeal);

            assert.equal(alimentSet[0].nombre, newAliment.nombre);
            assert.equal(alimentSet[0].descripcion, newAliment.descripcion);
            assert.equal(alimentSet[0].calorias, newAliment.calorias);
            assert.equal(alimentSet[0].idAlimento, newAliment.idAlimento);
            assert.equal(alimentSet[1].nombre, newAliment2.nombre);
            assert.equal(alimentSet[1].descripcion, newAliment2.descripcion);
            assert.equal(alimentSet[1].calorias, newAliment2.calorias);
            assert.equal(alimentSet[1].idAlimento, newAliment2.idAlimento);
        });
    });
});