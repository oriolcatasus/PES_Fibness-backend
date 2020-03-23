const assert = require("assert");

const user = require("../src/models/userModel");
const dbCtrl = require("../src/ctrls/dbCtrl");

describe("userModel script", function() {
    describe("create function", function() {
        beforeEach(async function() {
            await dbCtrl.execute("DELETE FROM usuarios");
        });


        it("should return user created correctly", async function() {
            let newUser = {
                nombre: "Oriol",
                password: "hash",
                email: "oriol@example.com",
            }
            await user.create(newUser);

            let query = {
                text: "SELECT nombre, password, email \
                        FROM usuarios \
                        WHERE nombre = $1",
                values: ["Oriol"],
            };
            let res = (await dbCtrl.execute(query)).rows[0];            
            assert.equal(newUser.nombre, res.nombre);
            assert.equal(newUser.password, res.password);
            assert.equal(newUser.email, newUser.email);
        });

        it("should return unique constraint violation", async function() {
            let newUser = {
                nombre: "Oriol",
                password: "hash",
                email: "oriol@example.com",
            }
            await user.create(newUser);

            assert.rejects(() => user.create(newUser), {
                message: "duplicate key value violates unique constraint \"usuarios_nombre_key\""
            });
        });

        it("should return not null constraint violation", async function() {
            let newUser = {
                nombre: "Oriol",
                email: "oriol@example.com",
            }

            assert.rejects(() => user.create(newUser), {
                message: "null value in column \"password\" violates not-null constraint"
            });
        });
    });
    describe("delete user", function() {
        it ("should return deleted", async function() {
            let newUser = {
                nombre: "Oriol",
                password: "hash",
                email: "oriol@example.com",
            }
            await user.create(newUser);
            await user.del(newUser);

            let query = {
                text: "SELECT nombre, password, email \
                        FROM usuarios" ,
            };
            let res = (await dbCtrl.execute(query)).rows.length();            
            assert.equal(res.size, 0);
        });
    });
});