const assert = require("assert");

const user = require("../src/models/userModel");
const dbCtrl = require("../src/ctrls/dbCtrl");

describe("userModel", function() {
    describe("create", function() {
        beforeEach(async function() {
            await dbCtrl.execute("DELETE FROM usuarios");
        });


        it("should create a new user", async function() {
            const fakeUser = {
                nombre: "FakeName",
                password: "fakeHash",
                email: "fake@example.com",
            }
            await user.create(fakeUser);

            const query = {
                text: "SELECT nombre, password, email \
                        FROM usuarios \
                        WHERE email = $1",
                values: [fakeUser.email],
            };
            const res = (await dbCtrl.execute(query)).rows[0];            
            assert.equal(fakeUser.nombre, res.nombre);
            assert.equal(fakeUser.password, res.password);
            assert.equal(fakeUser.email, res.email);

            dbCtrl.execute({
                text: "DELETE FROM usuarios WHERE email = $1",
                values: [fakeUser.email]
            });
        });

        it("should throw error when creating two users with the same email", async function() {
            const fakeUser = {
                nombre: "FakeName",
                password: "fakeHash",
                email: "fake@example.com",
            }
            await user.create(fakeUser);
            
            const fakeUser2 = {
                nombre: "FakeName2",
                password: "fakeHash2",
                email: fakeUser.email
            };

            await assert.rejects(() => user.create(fakeUser2), Error);

            dbCtrl.execute({
                text: "DELETE FROM usuarios WHERE email = $1",
                values: [fakeUser.email]
            });
        });

        it("should NOT insert a user without a password", async function() {
            const newUser = {
                nombre: "Oriol",
                email: "oriol@example.com",
            }

            assert.rejects(() => user.create(newUser), Error);
        });

        it("should NOT insert a user without a name", async function() {
            const newUser = {
                email: "oriol@example.com",
                password: "fakeHash"
            };
            assert.rejects(() => user.create(newUser), Error);
        });
    });
});