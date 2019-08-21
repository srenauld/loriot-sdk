import assert from 'assert';
import sinon from 'sinon';
import ws from 'ws';
import Data from '../src/data.js';

jest.mock('ws', () => {
    return jest.fn().mockImplementation( function() {
        
        let callbacks = {
            "message": [],
            "open": []
        };

        this.emit = jest.fn(function(event, data) {
                callbacks[event].forEach((cb) => cb(data));
        });
        this.on = jest.fn(function(event, cb) {
                callbacks[event].push(cb);
                return true;
        });
        this.send = jest.fn(function(data) {
            return true;
        });
    });
});

describe('Data', () => {
    it('Properly initializes retrieves and sends data', async () => {
        let data = await Data.fromCredentials({
            server: 'eu2',
            applicationId: 'foo',
            token: 'bar'
        });
        
        let mockedWS = require('ws').mock.instances[0];
        assert.equal(require('ws').mock.calls[0][0], "wss://eu2.loriot.io/app?id=foo&token=bar");

        let spy = sinon.spy();
        let gwSpy = sinon.spy();
        data.gateway('test', gwSpy);
        data.device('foobar', spy);
        data.all(spy);

        mockedWS.emit('message', JSON.stringify({
            cmd: 'gw',
            EUI: 'test'
        }));
        mockedWS.emit('message', JSON.stringify({
            cmd: 'rx',
            EUI: 'foobar',
            data: '01'
        }));

        assert(gwSpy.calledOnceWith(
            {
                cmd: 'gw',
                EUI: 'test'
            }
        ));
        assert(spy.calledTwice);
        assert(spy.calledWith({
            cmd: 'rx',
            EUI: 'foobar',
            data: '01'
        }));

        await data.send("foobar", "01", true);

        assert(mockedWS.send.mock.calls[0]);
        let output = JSON.parse(mockedWS.send.mock.calls[0][0]);
        assert.deepEqual(output, {
            cmd: 'tx',
            EUI: 'foobar',
            confirmed: true,
            data: '01',
            port: 1
        });

    });
})