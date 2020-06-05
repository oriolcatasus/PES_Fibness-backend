const SQL = require('sql-template-strings')

const expect = require('../chaiConfig')
const dbCtrl = require('../../src/ctrls/dbCtrl');
const event = require('../../src/models/eventModel')
const user = require('../../src/models/userModel');

describe('Event model', function() {

    const fakeUser = {
        nombre: 'Fake',
        password: 'fakeHash',
        email: 'fake@example.com',
    }

    const fakeEvent = {
        titulo: 'FakeTitulo',
        descripcion: 'FakeDescripcion',
        fecha: '2020-02-29',
        hora: '00:00',
        localizacion: 'fake',
        idcreador: null
    }

    const fakeParticipation = {
        idusuario: null
    }

    beforeEach(async function() {
        result = await user.create(fakeUser)
        fakeEvent.idcreador = fakeUser.id = result.id
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
            expect(result.rows).to.have.length(1)
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

    describe('getAll', function() {
        it('should get 4 events', async function() {
            const fakeEvents = [
                {
                    titulo: 'FakeTitulo5',
                    descripcion: 'FakeDescripcion5',
                    fecha: '2019-03-01',
                    hora: '11:00',
                    localizacion: 'fake2',
                    idcreador: fakeEvent.idcreador
                },
                {
                    titulo: 'FakeTitulo',
                    descripcion: 'FakeDescripcion',
                    fecha: '2020-02-29',
                    hora: '00:00',
                    localizacion: 'fake',
                    idcreador: fakeEvent.idcreador
                },
                {
                    titulo: 'FakeTitulo2',
                    descripcion: 'FakeDescripcion2',
                    fecha: '2020-03-01',
                    hora: '10:00',
                    localizacion: 'fake',
                    idcreador: fakeEvent.idcreador
                },
                {
                    titulo: 'FakeTitulo3',
                    descripcion: 'FakeDescripcion3',
                    fecha: '2020-03-01',
                    hora: '10:01',
                    localizacion: 'fake',
                    idcreador: fakeEvent.idcreador
                },
                {
                    titulo: 'FakeTitulo4',
                    descripcion: 'FakeDescripcion4',
                    fecha: '2020-03-01',
                    hora: '11:00',
                    localizacion: 'fake2',
                    idcreador: fakeEvent.idcreador
                }
            ]
            const promisesArray = fakeEvents.map(value => event.create(value))
            const results = await Promise.all(promisesArray)
            results.forEach((value, i) => {
                fakeEvents[i].id = value.id
            })
            const eventsdb = await event.getAll()
            expect(eventsdb).to.have.length(5)
            expect(eventsdb[0]).to.be.like(fakeEvents[4])
            expect(eventsdb[1]).to.be.like(fakeEvents[3])
            expect(eventsdb[2]).to.be.like(fakeEvents[2])
            expect(eventsdb[3]).to.be.like(fakeEvents[1])
            expect(eventsdb[4]).to.be.like(fakeEvents[0])
        })

        it('should get 0 events', async function() {
            const events = await event.getAll()
            expect(events).to.be.empty
        })
    })
    
    describe('getParticipants', function() {
        it('should get 2 participants', async function() {
            let res = await event.create(fakeEvent)
            fakeEvent.id = res.id
            const fakeParticipants = [
                {
                    nombre: 'FakeParticipant1',
                    password: 'fakeParticipantHash1',
                    email: 'fake@participant1.com',
                },
                {
                    nombre: 'FakeParticipant2',
                    password: 'fakeParticipantHash2',
                    email: 'fake@participant2.com',
                }
            ]
            let promisesArray = fakeParticipants.map(value => user.create(value))
            res = await Promise.all(promisesArray)
            res.forEach((value, index) => {
                fakeParticipants[index].id = value.id
            })            
            promisesArray = fakeParticipants.map(value => event.join(fakeEvent.id, { idusuario:value.id }))
            res = await Promise.all(promisesArray)
            const participants = await event.participants(fakeEvent.id)

            expect(participants).to.have.length(3)
            expect(participants).to.include.something.like({
                id: fakeUser.id,
                nombre: fakeUser.nombre,
            })
            expect(participants).to.include.something.like({
                id: fakeParticipants[0].id,
                nombre: fakeParticipants[0].nombre,
            })
            expect(participants).to.include.something.like({
                id: fakeParticipants[1].id,
                nombre: fakeParticipants[1].nombre,
            })
        })

        it('should get 1 participant, the creator', async function() {
            let res = await event.create(fakeEvent)
            fakeEvent.id = res.id
            const participants = await event.participants(fakeEvent.id)

            expect(participants).to.have.length(1)
            expect(participants).to.include.something.like({
                id: fakeUser.id,
                nombre: fakeUser.nombre,
            })
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
            expect(result.rows).to.have.length(1)
        })
    })

    describe('disjoin', function() {
        it('should remove a user from an event but not the event', async function() {
            let result = await event.create(fakeEvent)
            fakeEvent.id = result.id
            await event.join(fakeEvent.id, fakeParticipation)
            await event.disjoin(fakeEvent.id, fakeParticipation.idusuario)
            result = await Promise.all([
                dbCtrl.execute(SQL`
                    SELECT *
                    FROM participacionevento
                    WHERE idevento=${fakeEvent.id} and idusuario=${fakeParticipation.idusuario}`
                ),
                event.get(fakeEvent.id)
            ])
            expect(result[0].rows).to.be.empty
            expect(result[1]).to.not.be.undefined
        })

        it('should not remove the event creator neither the event', async function() {
            let result = await event.create(fakeEvent)
            fakeEvent.id = result.id
            await expect(event.disjoin(fakeEvent.id, { idusuario: fakeEvent.idcreador }))
                .to.be.eventually.rejected
            const eventdb = event.get(fakeEvent.id)
            expect(eventdb).to.not.be.undefined
        })

        it('should not remove the user from an event which they have not joined', async function() {
            let result = await event.create(fakeEvent)
            fakeEvent.id = result.id
            await expect(event.disjoin(fakeEvent.id, fakeParticipation)).to.be.eventually.rejected
            const eventdb = event.get(fakeEvent.id)
            expect(eventdb).to.not.be.undefined
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