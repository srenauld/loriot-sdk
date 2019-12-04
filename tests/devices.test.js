import Session from '../src/transports/session.js';
import axios from 'axios';
import sinon from 'sinon';
import assert, { doesNotReject } from 'assert';
import { Device, Devices } from '../src/devices.js';


describe('Devices', () => {
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
        client.token = {
            type: 'Session',
            value: 'foobar'
        }
    });
    it('Allows the modification of devices', async () => {
        let stub = sinon.stub(server, 'request');
        let devices = new Devices(client, "BE0100E3");

        stub.withArgs({
            method: 'GET',
            url: '1/nwk/app/BE0100E3/devices?page=1&perPage=10',
            headers: {
                Authorization: 'Session foobar'
            }
        }).returns({
            data: {"devices":[{"_id":"ABDEF01234567812","title":"AB-DE-F0-12-34-56-78-12","description":null,"appeui":"BE010000000000E3","organizationId":212,"visibility":"private","deveui":"ABDEF01234567812","devaddr":"001F93C3","seqno":-1,"seqdn":0,"seqq":0,"adrCnt":0,"txrate":null,"rxrate":null,"devclass":"A","rxw":1,"rx1":{"delay":1000000,"offset":0},"dutycycle":0,"adr":true,"adrMin":null,"adrMax":null,"adrFix":null,"seqrelax":true,"seqdnreset":true,"createdAt":"2019-08-14T23:32:39.445Z","bat":null,"devSnr":null,"packetLimit":null,"lorawan":{"major":1,"minor":0,"revision":2},"decodeTemplate":null,"canSend":true,"canSendFOPTS":true,"canSendPayload":true,"location":{"lat":null,"lon":null,"coordinates":{"type":"Point","coordinates":[null,null]}}}],"page":1,"perPage":10,"total":1}
        });

        let results = await devices.get(0, 10);
        assert.equal(results.length, 1);
        results[0].title = "My Klikklak";
        await results[0].update();
        assert(stub.calledWith({
            method: 'POST',
            url: '1/nwk/app/BE0100E3/device/ABDEF01234567812',
            data: {
                title: 'My Klikklak'
            },
            headers: {
                Authorization: 'Session foobar'
            }
        }));
    });
    it('Allows the creation and deletion of devices', async () => {
        let stub = sinon.stub(server, 'request');
        let devices = new Devices(client, "BE0100E3");

        stub.withArgs({
            method: 'POST',
            url: '1/nwk/app/BE0100E3/devices',
            data: {
                deveui: '0102030405060708',
                devclass: 'B'
            },
            headers: {
                Authorization: 'Session foobar'
            }
        }).returns({
            data: {
                _id: '0102030405060708',
                devclass: 'B'
            }
        });

        assert.rejects(devices.create({
            deveui: 'foobar'
        }));
        let device = await devices.create({
            deveui: '0102030405060708',
            devclass: 'B'
        });
        assert.equal(device._id, '0102030405060708');

        await device.delete();

        assert(stub.calledWith({
            method: 'DELETE',
            url: '1/nwk/app/BE0100E3/device/0102030405060708',
            headers: {
                Authorization: 'Session foobar'
            }
        }));
    })
});