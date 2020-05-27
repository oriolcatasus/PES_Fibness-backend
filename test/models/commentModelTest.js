const assert = require("assert");

const user = require("../../src/models/userModel");
const dbCtrl = require("../../src/ctrls/dbCtrl");
const comment = require("../../src/models/commentModel")
const training = require("../../src/models/trainingModel")

require("../rootHooks");


describe("comment operations", function() {
    it("should successfully make a comment", async function() {
        const fakeUser = {
            nombre: 'Fake',
            password: 'fakeHash',
            email: 'fake@example.com',
        }
        let res = await user.create(fakeUser);
        const id = res.id;

        const newTraining = {
            nombre: "TrainingTest",
            descripcion: "TrainingDescription",
            idUser: id,
        }
        const idElem = (await training.create(newTraining)).idElemento;

        const body = {
            idUser: id,
            idElement: idElem,
            text: 'nice'
        }

        await comment.comment(body);

        let query = {
            text: 'SELECT nComentarios \
                    FROM elementos \
                    WHERE idElemento = $1',
            values: [idElem]
        };

        res = (await dbCtrl.execute(query)).rows;
        assert.equal(res[0].ncomentarios, 1);

        query = {
            text: 'SELECT texto \
                    FROM comentarios \
                    WHERE idElemento = $1',
            values: [idElem]
        };

        res = (await dbCtrl.execute(query)).rows;

        assert.equal(res[0].texto, 'nice');
    });

    it("should successfully delete a comment", async function() {
        
        const fakeUser = {
            nombre: 'Fake',
            password: 'fakeHash',
            email: 'fake@example.com',
        }
        let res = await user.create(fakeUser);
        const id = res.id;

        const newTraining = {
            nombre: "TrainingTest",
            descripcion: "TrainingDescription",
            idUser: id,
        }
        const idElem = (await training.create(newTraining)).idElemento;

        const body = {
            idUser: id,
            idElement: idElem,
            text: 'nice'
        }

        await comment.comment(body);

        let query = {
            text: 'SELECT idComentario \
                    FROM comentarios \
                    WHERE idElemento = $1',
            values: [idElem]
        };
        
        idCom = (await dbCtrl.execute(query)).rows[0].idcomentario
        await comment.delComment(idCom)

        query = {
            text: 'SELECT nComentarios \
                    FROM elementos \
                    WHERE idElemento = $1',
            values: [idElem]
        };

        res = (await dbCtrl.execute(query)).rows;
        assert.equal(res[0].ncomentarios, 0);

        query = {
            text: 'SELECT texto \
                    FROM comentarios \
                    WHERE idElemento = $1',
            values: [idElem]
        };

        res = (await dbCtrl.execute(query)).rows;

        assert.equal(res.length, 0);
    });
    
});