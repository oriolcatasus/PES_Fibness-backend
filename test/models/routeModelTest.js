const assert = require("assert");

const user = require("../../src/models/userModel");
const dbCtrl = require("../../src/ctrls/dbCtrl");
const route = require("../../src/models/routeModel");

//const stops = require("../../src/models/stopsModel");

require("../rootHooks");

describe("routeModel script", function() {
    
    describe("create function", function() {

        it("should return route created correctly", async function() {
            //create user
            let newUser = {
                nombre: "Oriol",
                password: "hash",
                email: "oriol@example.com",
            }
            await user.create(newUser);
            
            //select id from user in order to create a route (we need it for the foreign key of element)
            let query = {
                text: "SELECT id \
                        FROM usuarios \
                        WHERE nombre = $1",
                values: ["Oriol"],
            };
            let res = (await dbCtrl.execute(query)).rows[0];
            idTest = res.id; 

            //create route (and element)
            let newRoute = {
                nombre: "RouteTest",
                descripcion: "RouteDescription",
                idUser: idTest,
                origen:"Coodenateorigen",
                destino:"Coordenatedestine",
                distancia: "distancia",
            }
            await route.create(newRoute);

            //get the automatically generated id for the route in order to access it
            let queryGetID = {
                text: "SELECT idElemento \
                        FROM elementos \
                        WHERE nombre = $1 and idUsuario = $2",
                values: [newRoute.nombre, idTest],
            };
            res = (await dbCtrl.execute(queryGetID)).rows[0];
            idElem = res.idelemento;

            //get the route that we have created
            query = {
                text: "SELECT nombre, descripcion, idUsuario \
                        FROM elementos \
                        WHERE idElemento = $1",
                values: [idElem],
            };

            //make sure it really is the route we created
            res = (await dbCtrl.execute(query)).rows[0];            
            assert.equal(newRoute.nombre, res.nombre);
            assert.equal(newRoute.descripcion, res.descripcion);
            assert.equal(idTest, res.idusuario);

            //same as above but with route
            query = {
                text: "SELECT idElemento, origen, destino, distancia \
                        FROM  rutas \
                        WHERE idElemento = $1",
                values: [idElem],
            };
            res = (await dbCtrl.execute(query)).rows[0]; 
            assert.equal(idElem, res.idelemento);
            assert.equal(newRoute.origen, res.origen);
            assert.equal(newRoute.destino, res.destino);
            assert.equal(newRoute.distancia, res.distancia);
        });

        it("should return unique constraint violation", async function() {
            //create user
            let newUser = {
                nombre: "Oriol",
                password: "hash",
                email: "oriol@example.com",
            }
            await user.create(newUser);
            
            //select id from user in order to create a route (we need it for the foreign key of element)
            let query = {
                text: "SELECT id \
                        FROM usuarios \
                        WHERE nombre = $1",
                values: ["Oriol"],
            };
            let res = (await dbCtrl.execute(query)).rows[0];
            idTest = res.id; 

            //create route (and element)
            let newRoute = {
                nombre: "RouteTest",
                descripcion: "RouteDescription",
                idUser: idTest,
                origen:"Coodenateorigen",
                destino:"Coordenatedestine",
                distancia: "distancia",

            }
            await route.create(newRoute);

            //create a route (and element) with same name and idUser, which violates unique constraint
            newRoute = {
                nombre: "RouteTest",
                descripcion: "RouteDescription2",
                idUser: idTest,
                origen:"Coodenateorigen",
                destino:"Coordenatedestine",
                distancia: "distancia",
            }
            assert.rejects(() => route.create(newRoute), Error);
        });
    });
    describe("delete function", function() {
        
        it("should return route deleted correctly", async function() {
           //create user
           let newUser = {
            nombre: "Oriol",
            password: "hash",
            email: "oriol@example.com",
            }
            await user.create(newUser);
            
            //select id from user in order to create a route (we need it for the foreign key of element)
            let query = {
                text: "SELECT id \
                        FROM usuarios \
                        WHERE nombre = $1",
                values: ["Oriol"],
            };
            let res = (await dbCtrl.execute(query)).rows[0];
            idTest = res.id; 

            //create route (and element)
            let newRoute = {
                nombre: "RouteTest",
                descripcion: "RouteDescription",
                idUser: idTest,
                origen:"Coodenateorigen",
                destino:"Coordenatedestine",
                distancia: "distancia",
            }
            await route.create(newRoute);

            //get the automatically generated id for the route in order to access it
            let queryGetID = {
                text: "SELECT idElemento \
                        FROM elementos \
                        WHERE nombre = $1 and idUsuario = $2",
                values: [newRoute.nombre, idTest],
            };
            res = (await dbCtrl.execute(queryGetID)).rows[0];
            idElem = res.idelemento;

            //deletion of the route
            await route.del(idElem);

            //making sure neither the route nor the element exist
            query = {
                text: "SELECT * \
                        FROM rutas" ,
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
        
        it("should return route update correctly", async function() {
            //create user
            let newUser = {
                nombre: "Oriol",
                password: "hash",
                email: "oriol@example.com",
            }
            await user.create(newUser);
            //select id from user in order to create a route (we need it for the foreign key of element)
            let query = {
                text: "SELECT id \
                        FROM usuarios \
                        WHERE nombre = $1",
                values: ["Oriol"],
            };
            let res = (await dbCtrl.execute(query)).rows[0];
            idTest = res.id; 
            //create route (and element)
            let newRoute = {
                nombre: "RouteTest",
                descripcion: "RouteDescription",
                idUser: idTest,
                origen:"Coodenateorigen",
                destino:"Coordenatedestine",
                distancia:"distancia",
            }
            await route.create(newRoute);
            //get the automatically generated id for the route in order to access it
            let queryGetID = {
                text: "SELECT idElemento \
                        FROM elementos \
                        WHERE nombre = $1 and idusuario = $2",
                values: [newRoute.nombre, idTest],
            };
            res = (await dbCtrl.execute(queryGetID)).rows[0];
            idElem = res.idelemento;
            let modifiedRoute = {
                nombre: "Route_Test",
                descripcion: "Route_Description",
                origen:"Coodenate_origen",
                destino:"Coordenate_destine",
                distancia:"distancia",
            }

            //update route
            await route.update(modifiedRoute, idElem);
            //get the modified route
            let query_elemento = {
                text: "SELECT nombre, descripcion, idusuario \
                        FROM elementos \
                        WHERE idElemento = $1",
                values: [idElem],
            };
            res = (await dbCtrl.execute(query_elemento)).rows[0];    

            //make sure the modifications have been made
            

            assert.equal(modifiedRoute.nombre, res.nombre);
            assert.equal(modifiedRoute.descripcion, res.descripcion);
            assert.equal(newRoute.idUser, res.idusuario);
            let query_ruta = {
                text: "SELECT origen, destino, distancia\
                        FROM rutas \
                        WHERE idElemento = $1",
                values: [idElem],
            };
            res = (await dbCtrl.execute(query_ruta)).rows[0]; 
            assert.equal(modifiedRoute.origen, res.origen);
            assert.equal(modifiedRoute.destino, res.destino);
            assert.equal(modifiedRoute.distancia, res.distancia);
        });
    });
    /*describe("get operation", function() {  

        it("should return set of stops correctly", async function(){
            //create user
            let newUser = {
                nombre: "Oriol",
                password: "hash",
                email: "oriol@example.com",
            }
            await user.create(newUser);

            //select id from user in order to create a route (we need it for the foreign key of element)
            let query = {
                text: "SELECT id \
                        FROM usuarios \
                        WHERE nombre = $1",
                values: ["Oriol"],
            };
            let res = (await dbCtrl.execute(query)).rows[0];
            let idTest = res.id; 

            //create route  (and element)
            let newRoute = {
                nombre: "RouteTest",
                descripcion: "RouteDescription",
                idUser: idTest,
                origen:"Coodenateorigen",
                destino:"Coordenatedestine",
            }
            await route.create(newRoute);

            //get the automatically generated id for the route in order to access it
            let queryGetID = {
                text: "SELECT idElemento \
                        FROM elementos \
                        WHERE nombre = $1 and idUsuario = $2",
                values: [newRoute.nombre, idTest],
            };
            res = (await dbCtrl.execute(queryGetID)).rows[0];
            idStopTest = res.idelemento;
            //Stop 1
            
            let newStop = {
                coordenada:"Coordenatedestine",
                idEntrenamiento: idStopTest, 
            }
            await exercise.create(newStop);
            //Stop 2
            let newStop2 = {
                coordenada:"Coordenatedestine2",
                idEntrenamiento: idStopTest, 
            }
            await exercise.create(newStop2);

            let stopSet = await route.activities(idStopTest);
            assert.equal(stopSet[0].coordenada, newStop.coordenada);
            assert.equal(stopSet[1].coordenada, newStop2.coordenada);
        });

    });*/
});