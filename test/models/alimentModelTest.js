const assert = require("assert");

const user = require("../../src/models/userModel");
const diet = require("../../src/models/dietModel");
const dbCtrl = require("../../src/ctrls/dbCtrl");
const meal = require("../../src/models/mealModel");
const aliment = require("../../src/models/alimentModel")

require("../rootHooks");

describe("alimentModel script", function() {
    describe("create function", function() {
        it("should return aliment created correctly", async function() {
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

            //create an aliment
            let newAliment = {
                nombre: "AlimentTest",
                descripcion: "descriptionTest",
                calorias: '300',
                idComida: idMeal,
            };

            idAliment = (await aliment.create(newAliment)).idAlimento;

            //make sure it really is the aliment we created
            query = {
                text: "SELECT nombre, descripcion, calorias, idComida \
                        FROM alimentos \
                        WHERE idAlimento = $1",
                values: [idAliment],
            };
            res = (await dbCtrl.execute(query)).rows[0];
            assert.equal(newAliment.nombre, res.nombre);            
            assert.equal(newAliment.descripcion, res.descripcion);
            assert.equal(newAliment.calorias, res.calorias);
            assert.equal(newAliment.idComida, res.idcomida);

        });
    });

    describe("delete function", function() {        
        it("should return aliment deleted correctly", async function() {
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

            //create a aliment
            let newAliment = {
                nombre: "AlimentTest",
                descripcion: "descriptionTest",
                calorias: '300',
                idComida: idMeal,
            };

            idAliment = (await aliment.create(newAliment)).idAlimento;

            //deletion of the aliment
            await aliment.del(idAliment);

            //making sure the aliment does not exist
            query = {
                text: "SELECT * \
                        FROM alimentos" ,
            };
            res = (await dbCtrl.execute(query)).rows;
            assert.equal(res.length, 0);
        });
    });

    describe("update function", function() {        
        it("should return aliment update correctly", async function() {

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

            //create a aliment
            let newAliment = {
                nombre: "AlimentTest",
                descripcion: "descriptionTest",
                calorias: '300',
                idComida: idMeal,
            };
            idAliment = (await aliment.create(newAliment)).idAlimento;

            let modifiedAliment = {
                nombre: "AlimentTest2",
                descripcion: "descriptionTest2",
                calorias: '100',
            }

            //update aliment
            await aliment.update(modifiedAliment, idAliment);

            //get the modified aliment
            query = {
                text: "SELECT nombre, descripcion, calorias \
                        FROM alimentos \
                        WHERE idAlimento = $1",
                values: [idAliment],
            };
            res = (await dbCtrl.execute(query)).rows[0];    

            //make sure the modifications have been made
            assert.equal(modifiedAliment.nombre, res.nombre);
            assert.equal(modifiedAliment.descripcion, res.descripcion);
            assert.equal(modifiedAliment.calorias, res.calorias);
        });
    });
});