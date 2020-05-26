const assert = require("assert");

const user = require("../../src/models/userModel");
const diet = require("../../src/models/dietModel");
const dbCtrl = require("../../src/ctrls/dbCtrl");
const meal = require("../../src/models/mealModel")

require("../rootHooks");

describe("dietModel script", function() {
    describe("create function", function() {
        it("should return diet created correctly", async function() {
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

            //get the diet that we have created
            query = {
                text: "SELECT nombre, descripcion, idUsuario \
                        FROM elementos \
                        WHERE idElemento = $1",
                values: [idElem],
            };

            //make sure it really is the element we created
            res = (await dbCtrl.execute(query)).rows[0];            
            assert.equal(newDiet.nombre, res.nombre);
            assert.equal(newDiet.descripcion, res.descripcion);
            assert.equal(idTest, res.idusuario);

            //same as above but with diet
            query = {
                text: "SELECT idElemento \
                        FROM dietas \
                        WHERE idElemento = $1",
                values: [idElem],
            };
            res = (await dbCtrl.execute(query)).rows[0]; 
            assert.equal(idElem, res.idelemento);

            //check the 7 days have been created
            let queryCheckDays = {
                text: "SELECT count(*) \
                        FROM diasDieta \
                        WHERE idElemento = $1",
                values: [idElem],
            };
            ndays = (await dbCtrl.execute(queryCheckDays)).rows[0].count; 

            assert.equal(ndays, 7);
        });

        it("should return unique constraint violation", async function() {
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

            //create diet (and element) with same name and idUser, which violates unique constraint
            newDiet = {
                nombre: "DietTest",
                descripcion: "DietDescription2",
                idUser: idTest,
            }
            assert.rejects(() => diet.create(newDiet), Error);
        });
    });

    describe("delete function", function() {        
        it("should return diet deleted correctly", async function() {
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

            //get the automatically generated id for the diet in order to access it
            let queryGetID = {
                text: "SELECT idElemento \
                        FROM elementos \
                        WHERE nombre = $1 and idUsuario = $2",
                values: [newDiet.nombre, idTest],
            };
            res = (await dbCtrl.execute(queryGetID)).rows[0];
            idElem = res.idelemento;

            //deletion of the diet
            await diet.del(idElem);

            //making sure neither the diet nor the element exist
            query = {
                text: "SELECT * \
                        FROM dietas" ,
            };
            res = (await dbCtrl.execute(query)).rows;
            assert.equal(res.length, 0);

            query = {
                text: "SELECT * \
                        FROM elementos" ,
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
            

            //get the automatically generated id for the diet in order to access it
            let queryGetID = {
                text: "SELECT idElemento \
                        FROM elementos \
                        WHERE nombre = $1 and idUsuario = $2",
                values: [newDiet.nombre, idTest],
            };
            res = (await dbCtrl.execute(queryGetID)).rows[0];
            idElem = res.idelemento;


            let modifiedDiet = {
                nombre: "DietTest2",
                descripcion: "DietTest2",
            }

            //update diet
            await diet.update(modifiedDiet, idElem);

            //get the modified diet
            query = {
                text: "SELECT nombre, descripcion, idUsuario \
                        FROM elementos \
                        WHERE idElemento = $1",
                values: [idElem],
            };
            res = (await dbCtrl.execute(query)).rows[0];    

            //make sure the modifications have been made
            assert.equal(modifiedDiet.nombre, res.nombre);
            assert.equal(modifiedDiet.descripcion, res.descripcion);
            assert.equal(newDiet.idUser, res.idusuario);
        });
    });
    describe("get function", function() {
        it("should return meals of a day correctly", async function() {
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

            await meal.create(newMeal);

            //create a meal 2
            let newMeal2 = {
                nombre: "MealTest2",
                horaComida: '15:00:00',
                idElemento: idElem,
                tipoDia: "miercoles",
            };

            await meal.create(newMeal2);

            //create a meal for another day
            let newMeal3 = {
                nombre: "MealTest2",
                horaComida: '15:00:00',
                idElemento: idElem,
                tipoDia: "sabado",
            };

            await meal.create(newMeal3);

            res = await diet.dayMeals(idElem, "miercoles");
            assert.equal(res.length, 2);
            assert.equal(res[0].nombre, newMeal2.nombre);
            assert.equal(res[1].nombre, newMeal.nombre);
        })
    })

    describe("comment operations", function() {
        it("should return set of comments correctly", async function(){
            //create user
            let newUser = {
                nombre: "Oriol",
                password: "hash",
                email: "oriol@example.com",
            }
            await user.create(newUser);

            //select id from user in order to create a training (we need it for the foreign key of element)
            let query = {
                text: "SELECT id \
                        FROM usuarios \
                        WHERE nombre = $1",
                values: ["Oriol"],
            };
            let res = (await dbCtrl.execute(query)).rows[0];
            let idTest = res.id; 

            //create diet  (and element)
            let newDiet = {
                nombre: "DietTest",
                descripcion: "DietDescription",
                idUser: idTest,
            }
            await diet.create(newDiet);

            //get the automatically generated id for the training in order to access it
            let queryGetID = {
                text: "SELECT idElemento \
                        FROM elementos \
                        WHERE nombre = $1 and idUsuario = $2",
                values: [newDiet.nombre, idTest],
            };
            res = (await dbCtrl.execute(queryGetID)).rows[0];
            idDietTest = res.idelemento;

            let body = {
                idUser: idTest,
                idElement: idDietTest,
                text: "primer comentario"
            }
            await user.comment(body);

            body = {
                idUser: idTest,
                idElement: idDietTest,
                text: "segundo comentario"
            }

            await user.comment(body);
            const commentSet = await diet.comments(idDietTest);
            assert.equal(commentSet[0].idusuario, body.idUser);
            assert.equal(commentSet[0].texto, "primer comentario");
            assert.equal(commentSet[1].texto, "segundo comentario");
        });

    });
});