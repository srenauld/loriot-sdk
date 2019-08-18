import Session from '../src/transports/session.js';
import axios from 'axios';
import sinon from 'sinon';
import assert, { doesNotReject } from 'assert';
import { Application, Applications } from '../src/applications.js';

describe('Applications', () => {
    var server;
    var client;
    beforeEach(() => {
        server = axios.create({
            baseURL: 'https://eu2.loriot.io/'
        });
        client = new Session(server, {
            username: 'foo',
            password: 'bar'
        });
        client.token = 'foobar';
    });
    describe('Creation', () => {
        
        let apps = new Applications(client);
        assert.rejects(apps.create({}));
    })

    describe('Listing', () => {
        it('Lists applications and their devices', async () => {
            let stub = sinon.stub(server, 'request');
            stub.withArgs({
                method: 'GET',
                url: '1/nwk/apps?page=1&perPage=10',
                headers: {
                    Authorization: 'Session foobar'
                }
            }).returns({data:{"apps":[{"_id":3187736803,"name":"SampleApp","ownerid":230,"organizationId":212,"owneremail":"foo@bar.com","visibility":"private","created":"2019-08-14T10:22:04.747Z","devices":1,"deviceLimit":10,"mcastdevices":0,"mcastdevlimit":1,"outputs":[{"output":"websocket","osetup":{"url":"wss://eu2.loriot.io/app?token={token}"}}],"overbosity":"full","odataenc":"hex","ogwinfo":"full","orx":true,"cansend":true,"canotaa":true,"suspended":false,"masterkey":"foo","clientsLimit":10,"cfgDevBase":{"devclass":"A","rxw":1,"dutycycle":0,"adr":true,"adrMin":null,"adrMax":null,"adrFix":null,"seqrelax":true,"seqdnreset":true},"joinServer":null,"publishAppSKey":false,"accessRights":[{"token":"foo","data":true,"appServer":true,"devProvisioning":true}]}],"page":1,"perPage":10,"total":1}});
            stub.withArgs({
                method: 'GET',
                url: '1/nwk/app/BE0100E3/devices?page=1&perPage=10',
                headers: {
                    Authorization: 'Session foobar'
                }
            }).returns({
                data: {
                    total: 0,
                    devices: []
                }
            });
            let apps = new Applications(client);
            let data = await apps.get(0, 10);
            assert.equal(data.length, 1);
            assert.equal(data[0].name, "SampleApp");

            let devices = await data[0].devices().get(0, 10);
            assert.equal(devices.length, 0);
            assert(stub.calledWith({
                method: 'GET',
                url: '1/nwk/app/BE0100E3/devices?page=1&perPage=10',
                headers: {
                    Authorization: 'Session foobar'
                }
            }))
        });
    });
    describe('Deletion', () => {
        it('Deletes applications correctly', async () => {
            let stub = sinon.stub(server, 'request');
            stub.withArgs({
                method: 'GET',
                url: '1/nwk/apps?page=1&perPage=10',
                headers: {
                    Authorization: 'Session foobar'
                }
            }).returns({data:{"apps":[{"_id":3187736803,"name":"SampleApp","ownerid":230,"organizationId":212,"owneremail":"foo@bar.com","visibility":"private","created":"2019-08-14T10:22:04.747Z","devices":1,"deviceLimit":10,"mcastdevices":0,"mcastdevlimit":1,"outputs":[{"output":"websocket","osetup":{"url":"wss://eu2.loriot.io/app?token={token}"}}],"overbosity":"full","odataenc":"hex","ogwinfo":"full","orx":true,"cansend":true,"canotaa":true,"suspended":false,"masterkey":"foo","clientsLimit":10,"cfgDevBase":{"devclass":"A","rxw":1,"dutycycle":0,"adr":true,"adrMin":null,"adrMax":null,"adrFix":null,"seqrelax":true,"seqdnreset":true},"joinServer":null,"publishAppSKey":false,"accessRights":[{"token":"bar","data":true,"appServer":true,"devProvisioning":true}]}],"page":1,"perPage":10,"total":1}});
            let apps = new Applications(client);
            let data = await apps.get(0, 10);
            assert.equal(data.length, 1);
            assert.equal(data[0].name, "SampleApp");

            await data[0].delete();
            assert(stub.calledWith({
                method: 'DELETE',
                url: '1/nwk/app/BE0100E3',
                headers: {
                    Authorization: 'Session foobar'
                }
            }))
        })
    })
});