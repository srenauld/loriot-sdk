import Session from '../src/transports/session.js';
import axios from 'axios';
import sinon from 'sinon';
import assert, { doesNotReject } from 'assert';
import {Network, Networks } from '../src/networks.js';
import {Gateway, Gateways} from '../src/gateways.js';
import { isTSAnyKeyword } from '@babel/types';


describe('Gateways', () => {
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
    it('Properly lists gateways through a generator', async () => {
        let gws = new Gateways(client, 'A00000FD');
        let stub = sinon.stub(server, 'request');
        stub.withArgs({
            url: '1/nwk/network/A00000FD/gateways?page=1&perPage=10',
            method: 'GET',
            headers: {
                Authorization: 'Session foobar'
            }
        }).returns({
            data: {"total":1,"gateways":[{"_id":"010245FFFF678931","createdAt":"2019-08-13T11:56:39.431Z","title":"01-02-45-FF-FF-67-89-31","base":"pktfwd","model":"semtech","basename":"Packet Forwarder","modelname":"Semtech","version":"udp4.2","concentrator":"pktfwd","concentratorname":"Packet forwarder","bus":"UDP","card":0,"location":{"address":"Chemin des Buissons, 1","city":"Corminboeuf","zip":"1720","country":"CH","lat":46.8074478,"lon":7.1011634,"latProtected":46.8074478,"lonProtected":7.1011634,"coordinates":{"type":"Point","coordinates":[7.1011634,46.8074478]}},"MAC":"01:02:45:67:89:31","EUI":"01-02-45-FF-FF-67-89-31","visibility":"public","alerts":false,"connected":true,"lastData":"2019-08-13T22:43:10.667Z","lastStarted":"1970-01-01T00:00:00.000Z","lastPong":1565736190667,"radioband":"EU868_Semtech","autoUpdate":true}]}
        });
        stub.withArgs({
            url: '1/nwk/network/A00000FD/gateways?page=2&perPage=10',
            method: 'GET',
            headers: {
                Authorization: 'Session foobar'
            }
        }).returns({
            data: {"total":1,"gateways":[] }
        });

        let generator = gws.all();
        let gateways = 0;
        for await (let o of generator) {
            gateways++;
        }
        assert.equal(gateways, 1);

        assert(stub.calledWith({
            url: '1/nwk/network/A00000FD/gateways?page=1&perPage=10',
            method: 'GET',
            headers: {
                Authorization: 'Session foobar'
            }
        }));
        assert(stub.calledWith({
            url: '1/nwk/network/A00000FD/gateways?page=2&perPage=10',
            method: 'GET',
            headers: {
                Authorization: 'Session foobar'
            }
        }));
    })
});