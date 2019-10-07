import assert from 'assert';
import sinon from 'sinon';
import util from 'util';
import ws from 'ws';
import Data from '../src/data.js';

jest.mock('ws', () => {
    return jest.fn().mockImplementation( function() {
        let callbacks = {
            "message": [],
            "open": [],
            "close": []
        };

        this.emit = jest.fn(function(event, data) {
            for (let o of callbacks[event]) {
                o(data)
            }
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
        
        let mockedWS = data.socket.socket;
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
        assert.deepStrictEqual(output, {
            cmd: 'tx',
            EUI: 'foobar',
            confirmed: true,
            data: '01',
            port: 1
        });
        data.close();
    });
    it('Properly resumes connection on data closure', async () => {
        let data = await Data.fromCredentials({
            server: 'eu2',
            applicationId: 'foo',
            token: 'bar'
        });
        
        let mockedWS = data.socket.socket;
        let spy = sinon.spy();
        data.device('foobaz', (message) => {
            spy(message);
        });
        mockedWS.emit('message', JSON.stringify({
            cmd: 'rx',
            EUI: 'foobaz',
            data: '01'
        }));
        assert(spy.calledWith({
            cmd: 'rx',
            EUI: 'foobaz',
            data: '01'
        }));
        assert(spy.calledOnce);
        data.socket.startedAt = new Date().getTime() - 1200;
        mockedWS.emit('close');

        let newMockedWS = data.socket.socket;
        assert.notStrictEqual(mockedWS, newMockedWS);
        mockedWS.emit('message', JSON.stringify({
            cmd: 'rx',
            EUI: 'foobaz',
            data: '01'
        }));
        assert.strictEqual(spy.callCount, 2);

        assert.throws(() => {
            mockedWS.emit('close');
        });
        data.close();

    })
})