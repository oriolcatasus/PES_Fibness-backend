const assert = require("assert");

const user = require("../src/models/userModel");
const dbCtrl = require("../src/ctrls/dbCtrl");

describe("userModel script", function() {
    describe("create function", function() {
        it("should return user created correctly", async function() {
            let newUser = {
                nombre: "Oriol",
                password: "hash",
                email: "oriol@example.com",
            }
            await user.create(newUser);
            let query = "SELECT nombre, password, email " +
                        "FROM usuarios " + 
                        "WHERE nombre = 'Oriol'";
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
            assert.rejects(async () => user.create(newUser), Error);
        });

        it("should return not null constraint violation", async function() {
            let newUser = {
                nombre: "Oriol",
                email: "oriol@example.com",
            }
            assert.rejects(async () => user.create(newUser), Error);
        });

        afterEach(async function() {
            await dbCtrl.execute("DELETE FROM usuarios WHERE nombre = 'Oriol'");
        })
    });
});