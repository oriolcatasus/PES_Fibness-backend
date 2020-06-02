const supertest = require('supertest')

const expect = require('../chaiConfig')
const { app } = require('../../src/app')

const request = supertest(app)

describe('Event route test', function() {

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
        const res = await request.post('/user')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send(fakeUser)
        fakeEvent.idcreador = res.body.id
    })

    describe('POST /event', function() {
        it('should create an event', async function() {
            const res = await request.post('/event')
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .send(fakeEvent)
                .expect('Content-Type', /json/)
                .expect(201)
            expect(res.body.id).not.to.be.undefined
        })

        it('should not retrieve an event with an incorrect id', async function() {
            const badEvent = { }
            await request.post('/event')
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .send(badEvent)
                .expect(500)
        })
    })

    describe('GET /event/:id', function() {
        it('should get an event', async function() {
            let res = await request.post('/event')
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .send(fakeEvent)
            const id = res.body.id
            res = await request.get(`/event/${id}`)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
            expect(res.body.titulo).not.to.be.undefined
            expect(res.body.descripcion).not.to.be.undefined
            expect(res.body.fecha).not.to.be.undefined
            expect(res.body.hora).not.to.be.undefined
            expect(res.body.localizacion).not.to.be.undefined
            expect(res.body.idcreador).not.to.be.undefined
        })

        it('should not retrieve an event with an incorrect id', async function() {
            const badId = 'badId'
            await request.get(`/event/${badId}`)
                .set('Accept', 'application/json')
                .expect(500)
        })
    })

    describe('PUT /event/:id', function() {

        const newEvent = {
            titulo: 'NewFakeTitulo',
            descripcion: 'NewFakeDescription',
            fecha: '29/02/2019',
            hora: '23:59',
            localizacion: 'newFake'
        }

        it('should edit an event', async function() {
            let res = await request.post('/event')
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .send(fakeEvent)
            const id = res.body.id            
            await request.put(`/event/${id}`)
                .set('Content-Type', 'application/json')
                .send(newEvent)
                .expect(200)
        })

        it('should not edit an event with an incorrect id', async function() {
            const badId = 'badId'
            await request.put(`/event/${badId}`)
                .set('Content-Type', 'application/json')
                .send(newEvent)
                .expect(500)
        })
    })

    describe('DELETE /event/:id', function() {
        it('should delete an event', async function() {
            let res = await request.post('/event')
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .send(fakeEvent)
            const id = res.body.id
            await request.delete(`/event/${id}`)
                .expect(200)
        })

        it('should not delete an event with a bad formatted id', async function() {
            const badId = 'badId'
            await request.delete(`/event/${badId}`)
                .expect(500)
        })
    })
})

