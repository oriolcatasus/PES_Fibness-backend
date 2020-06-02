const assert = require("assert");

const user = require("../../src/models/userModel");
const dbCtrl = require("../../src/ctrls/dbCtrl");
const statistic = require("../../src/models/statisticModel");

//const stops = require("../../src/models/stopsModel");

require("../rootHooks");
describe("statisticModel script", function() {
    
    describe("create function", function() {

        it("should return statistic created correctly", async function() {
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
            let newStatistic = {
                idUser: idTest,
                dstRecorrida: "60",
            }
            await statistic.create(newStatistic)

            //get the automatically generated id for the route in order to access it
            let queryGetID = {
                text: "SELECT * FROM estadisticas WHERE idUsuario=$1 and fecha=CURRENT_DATE",
                values: [newStatistic.idUser],
            };
            res = (await dbCtrl.execute(queryGetID)).rows[0];
                
            assert.equal(newStatistic.idUser, res.idusuario);
            assert.equal(newStatistic.dstRecorrida, res.dstrecorrida);
        });
    });
    describe("update function", function() {
        
        it("should return statistic update correctly", async function() {
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
            let newStatistic = {
                idUser: idTest,
                dstRecorrida: "400",
            }
            await statistic.create(newStatistic)

            let newStatistic2 = {
                idUser: idTest,
                dstRecorrida: "600",
            }
            //It should add 600 meters to the previos 400 meters
            await statistic.create(newStatistic2)

            //get the automatically generated id for the route in order to access it
            let queryGetID = {
                text: "SELECT * FROM estadisticas WHERE idUsuario=$1 and fecha=CURRENT_DATE",
                values: [newStatistic.idUser],
            };
            res = (await dbCtrl.execute(queryGetID)).rows[0];
            let dstRecorridaTotal = parseInt(newStatistic) + parseInt(newStatistic2);
            dstRecorridaTotal = dstRecorridaTotal.toString();
            assert.equal(newStatistic2.idUser, res.idusuario);
            assert.equal(dstRecorridaTotal, res.dstrecorrida);
        });
    });
});