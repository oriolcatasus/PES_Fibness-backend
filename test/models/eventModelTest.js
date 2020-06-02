const SQL = require('sql-template-strings')

const expect = require('../chaiConfig')
const dbCtrl = require('../../src/ctrls/dbCtrl');
const event = require('../../src/models/eventModel')
const user = require('../../src/models/userModel');

//require("../rootHooks");

describe('Event model', function() {

    const fakeEvent = {
        titulo: 'FakeTitulo',
        descripcion: 'FakeDescripcion',
        fecha: '29/02/2020',
        hora: '00:00',
        localizacion: 'fake',
        idcreador: null
    }

    beforeEach(async function() {
        const fakeUser = {
            nombre: 'Fake',
            password: 'fakeHash',
            email: 'fake@example.com',
        }
        const res = await user.create(fakeUser)
        fakeEvent.idcreador = res.id
    })

    describe('create', function() {
        it('should create a new event', async function() {
            let result1 = await event.create(fakeEvent)
            const idEvent = result1.id

            const eventDb = await event.get(idEvent)
            expect(fakeEvent.titulo).to.equal(eventDb.titulo)
            expect(fakeEvent.descripcion).to.equal(eventDb.descripcion)
            expect(fakeEvent.fecha).to.equal(eventDb.fecha)
            expect(fakeEvent.hora).to.equal(eventDb.hora)
            expect(fakeEvent.localizacion).to.equal(eventDb.localizacion)
            expect(fakeEvent.idcreador).to.equal(eventDb.idcreador)
        })
    })

    describe('get', function() {
        it('should retrieve an event', async function() {
            let result = await event.create(fakeEvent)
            const idEvent = result.id
            const eventDb = await event.get(idEvent)
            
            expect(fakeEvent.titulo).to.equal(eventDb.titulo)
            expect(fakeEvent.descripcion).to.equal(eventDb.descripcion)
            expect(fakeEvent.fecha).to.equal(eventDb.fecha)
            expect(fakeEvent.hora).to.equal(eventDb.hora)
            expect(fakeEvent.localizacion).to.equal(eventDb.localizacion)
            expect(fakeEvent.idcreador).to.equal(eventDb.idcreador)
        })
    })

    describe('del', function() {
        it('should delete an event', async function() {
            let result = await event.create(fakeEvent)
            const idEvent = result.id
            await event.del(idEvent)       
            
            const eventDb = await event.get(idEvent)
            expect(eventDb).to.be.undefined
        })
    })
    
    describe('edit', function() {
        it('should edit an event', async function() {
            let result = await event.create(fakeEvent)
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