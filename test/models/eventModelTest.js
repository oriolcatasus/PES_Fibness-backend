const SQL = require('sql-template-strings')

const expect = require('../chaiConfig')
const dbCtrl = require('../../src/ctrls/dbCtrl');
const event = require('../../src/models/eventModel')
const user = require('../../src/models/userModel');

describe('Event model', function() {

    const fakeEvent = {
        titulo: 'FakeTitulo',
        descripcion: 'FakeDescripcion',
        fecha: '29/02/2020',
        hora: '00:00',
        localizacion: 'fake',
        idcreador: null
    }

    const fakeParticipation = {
        idusuario: null
    }

    beforeEach(async function() {
        const fakeUser = {
            nombre: 'Fake',
            password: 'fakeHash',
            email: 'fake@example.com',
        }
        result = await user.create(fakeUser)
        fakeEvent.idcreador = result.id
        const fakeParticipant = {
            nombre: 'FakeParticipant',
            password: 'fakeParticipantsHash',
            email: 'fake@participant.com',
        }
        result = await user.create(fakeParticipant)
        fakeParticipation.idusuario = result.id
    })

    describe('create', function() {
        it('should create a new event', async function() {
            let result = await event.create(fakeEvent)
            fakeEvent.id = result.id

            const eventDb = await event.get(fakeEvent.id)
            const query = SQL`
                SELECT *
                FROM participacionevento
                WHERE idusuario=${fakeEvent.idcreador} and idevento=${fakeEvent.id}`
            result = await dbCtrl.execute(query)
            expect(fakeEvent.titulo).to.equal(eventDb.titulo)
            expect(fakeEvent.descripcion).to.equal(eventDb.descripcion)
            expect(fakeEvent.fecha).to.equal(eventDb.fecha)
            expect(fakeEvent.hora).to.equal(eventDb.hora)
            expect(fakeEvent.localizacion).to.equal(eventDb.localizacion)
            expect(fakeEvent.idcreador).to.equal(eventDb.idcreador)
            expect(result.rows).to.be.lengthOf(1)
        })
    })

    describe('get', function() {
        it('should retrieve an event', async function() {
            let result = await event.create(fakeEvent)
            fakeEvent.id = result.id
            const eventDb = await event.get(fakeEvent.id)
            
            expect(fakeEvent.titulo).to.equal(eventDb.titulo)
            expect(fakeEvent.descripcion).to.equal(eventDb.descripcion)
            expect(fakeEvent.fecha).to.equal(eventDb.fecha)
            expect(fakeEvent.hora).to.equal(eventDb.hora)
            expect(fakeEvent.localizacion).to.equal(eventDb.localizacion)
            expect(fakeEvent.idcreador).to.equal(eventDb.idcreador)
        })
    })

    describe('join', function() {
        it('should let a user join an event', async function() {
            let result = await event.create(fakeEvent)
            fakeEvent.id = result.id            
            await event.join(fakeEvent.id, fakeParticipation)

            const query = SQL`
                SELECT *
                FROM participacionevento
                WHERE idevento=${fakeEvent.id} and idusuario=${fakeParticipation.idusuario}`
            result = await dbCtrl.execute(query)
            expect(result.rows).to.be.lengthOf(1)
        })
    })

    describe('disjoin', function() {
        it('should remove a user from an event', async function() {
            let result = await event.create(fakeEvent)
            fakeEvent.id = result.id
            await event.join(fakeEvent.id, fakeParticipation)
            await event.disjoin(fakeEvent.id, fakeParticipation.idusuario)

            const query = SQL`
                SELECT *
                FROM participacionevento
                WHERE idevento=${fakeEvent.id} and idusuario=${fakeParticipation.idusuario}`
            result = await dbCtrl.execute(query)
            expect(result.rows).to.be.empty
        })

        it('should not remove the event creator', async function() {
            let result = await event.create(fakeEvent)
            fakeEvent.id = result.id
            await expect(event.disjoin(fakeEvent.id, fakeEvent.idcreador)).to.be.eventually.rejected
        })
    })

    describe('del', function() {
        it('should delete an event', async function() {
            let result = await event.create(fakeEvent)
            const idEvent = result.id
            await event.del(idEvent)       
            
            const eventDb = await event.get(idEvent)
            const query = SQL`
                SELECT *
                FROM participacionevento
                WHERE idevento=${idEvent}`
            result = await dbCtrl.execute(query)
            expect(eventDb).to.be.undefined
            expect(result.rows).to.be.empty
        })

        it('should delete an event with participants', async function() {
            let result = await event.create(fakeEvent)
            const idEvent = result.id
            await event.join(idEvent, fakeParticipation)
            await event.del(idEvent)
            
            const eventDb = await event.get(idEvent)
            const query = SQL`
                SELECT *
                FROM participacionevento
                WHERE idevento=${idEvent}`
            result = await dbCtrl.execute(query)
            expect(eventDb).to.be.undefined
            expect(result.rows).to.be.empty
        })
    })
    
    describe('edit', function() {
        it('should edit an event', async function() {
            const result = await event.create(fakeEvent)
            const idEvent = result.id
            const newEvent = {
                titulo: 'NewFakeTitulo',
                descripcion: 'NewFakeDescription',
                fecha: '29/02/2019',
                hora: '23:59',
                localizacion: 'newFake'
            }
            await event.edit(idEvent, newEvent)

            const eventDb = await event.get(idEvent)
            expect(newEvent.titulo).to.equal(eventDb.titulo)
            expect(newEvent.descripcion).to.equal(eventDb.descripcion)
            expect(newEvent.fecha).to.equal(eventDb.fecha)
            expect(newEvent.hora).to.equal(eventDb.hora)
            expect(newEvent.localizacion).to.equal(eventDb.localizacion)
        })
    })
})