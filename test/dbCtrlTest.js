const assert = require("assert");

const dbCtrl = require("../src/ctrls/dbCtrl");

require("./rootHooks");

describe("dbCtrl", async function() {
    describe("cleanTables", async function() {
        it("should delete all rows from usuarios", async function() {
            const fakeUser = {
                nombre: "Fake",
                password: "fakeHash",
                email: "fake@example.com"
            };
            let query = {
                text: "INSERT INTO usuarios(nombre, email, password) VALUES($1, $2, $3)",
                values: [fakeUser.nombre, fakeUser.email, fakeUser.password]
            };
            await dbCtrl.execute(query);
            query = {
                text: "SELECT id \
                        FROM usuarios \
                        WHERE email = $1",
                values: [fakeUser.email],
            };
            const idUser = (await dbCtrl.execute(query)).rows[0].id;
            const fakeDiet = {
                nombre: "fakeNombre",
                descripcion: "fakeDescripcion"
            }
            query = {
                text: "INSERT INTO elementos(nombre, descripcion, idUsuario) values($1, $2, $3)",
                values: [fakeDiet.nombre, fakeDiet.descripcion, idUser]
            }
            await dbCtrl.execute(query);
            query = {
                text: "SELECT idElemento \
                        FROM elementos \
                        WHERE nombre = $1 and idUsuario = $2",
                values: [fakeDiet.nombre, idUser],
            };
            const idElemento = (await dbCtrl.execute(query)).rows[0].idelemento;
            query = {
                text: "INSERT INTO dietas(idElemento) values($1)",
                values: [idElemento],
            }
            await dbCtrl.execute(query);
            
            
            await dbCtrl.delAll();
            const usuarios = (await dbCtrl.execute("SELECT * FROM usuarios")).rows.length;
            assert.strictEqual(usuarios, 0);
            const elementos = (await dbCtrl.execute("SELECT * FROM elementos")).rows.length;
            assert.strictEqual(elementos, 0);
            const dietas = (await dbCtrl.execute("SELECT * FROM dietas")).rows.length;
            assert.strictEqual(dietas, 0);
        });

        it("should NOT delete migrations", async function() {
            const query = "SELECT * FROM undefined";
            const result1 = (await dbCtrl.execute(query)).rows.length;
            await dbCtrl.delAll();
            const result2 = (await dbCtrl.execute(query)).rows.length;

            assert.strictEqual(result1, result2)
        });
    });
});