const assert = require("assert");

const user = require("../src/models/userModel");
const dbCtrl = require("../src/ctrls/dbCtrl");

require("./rootHooks");

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
            const newUser = {
                nombre: "Fake",
                password: "fakeHash",
                email: "fake@example.com",
            }
            await user.create(newUser);

            await assert.rejects(async () => user.create(newUser), Error);
        });

        it("should return not null constraint violation", async function() {
            const newUser = {
                nombre: "Fake",
                email: "fake@example.com",
            }

            await assert.rejects(async () => user.create(newUser), Error);
        });
    });


    describe("delete user", function() {
        beforeEach(async function() {
            await dbCtrl.execute("DELETE FROM usuarios");
        });
        
        it ("should return deleted correctly", async function() {
            let newUser = {
                nombre: "Oriol",
                password: "hash",
                email: "oriol@example.com",
            }
            await user.create(newUser);
            let newUser2 = {
                nombre: "Oriol2",
                password: "hash2",
                email: "oriol2@example.com",
            }
            await user.create(newUser2);
            
            let queryGetID = {
                text: "SELECT id \
                        FROM usuarios \
                        WHERE nombre = $1",
                values: ["Oriol"],
            };
            let idTest = (await dbCtrl.execute(queryGetID)).rows[0].id;
            await user.del(idTest);

            let query = {
                text: "SELECT nombre, password, email \
                        FROM usuarios" ,
            };
            let res = (await dbCtrl.execute(query)).rows;
            assert.equal(res.length, 1);
        });
    });

    describe("validate", function() {

        const fakeUser = {
            nombre: "FakeName",
            password: "fakeHash",
            email: "fake@example.com",
        };

        before(async function() {
            await dbCtrl.execute("DELETE FROM usuarios");            
            await user.create(fakeUser);
        });


        it("should validate email & password", async function(){
            const validation = await user.validate({
                email: fakeUser.email,
                password: fakeUser.password
            });

            const query = {
                text: 'SELECT id FROM usuarios \
                        WHERE email = $1',
                values: [fakeUser.email]
            }
            const id = (await dbCtrl.execute(query)).rows[0].id;
            assert.strictEqual(validation.result, true);
            assert.strictEqual(validation.id, id);
        });

        it("should NOT validate email & password", async function() {
            const validation = await user.validate({
                email: "another@example.com",
                password: "anotherHash"
            });

            assert.strictEqual(validation.result, false);
            assert.strictEqual(validation.id, undefined);
        });

        it("should NOT validate just email", async function() {
            const validation = await user.validate({
                email: fakeUser.email
            });

            assert.strictEqual(validation.result, false);
            assert.strictEqual(validation.id, undefined);
        });

        it("should NOT validate just password", async function() {
            const validation = await user.validate({
                password: fakeUser.password
            });

            assert.strictEqual(validation.result, false);
            assert.strictEqual(validation.id, undefined);
        });

        after(async function() {
            await dbCtrl.execute({
                text: "DELETE FROM usuarios WHERE nombre=$1",
                values: [fakeUser.nombre]
            });
        });
    });
});