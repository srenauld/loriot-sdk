import Session from '../src/transports/session.js';
import axios from 'axios';
import sinon from 'sinon';
import assert, { doesNotReject } from 'assert';
import {Network, Networks } from '../src/networks.js';
import {Gateway} from '../src/gateways.js';

describe('Networks', () => {
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
        };
    });
    describe('Network retrieval', () => {
        it('Retrieves networks', async () => {
            let networks = new Networks(client);
            let stub = sinon.stub(server, 'request');
            stub.withArgs({
                url: '1/nwk/networks?page=1&perPage=10',
                method: 'GET',
                headers: {
                    Authorization: 'Session foobar'
                }
            }).returns({
                data: {
                    networks: [
                        {
                            _id: 2684354813,
                            userid: 1,
                            organizationId: 123,
                            visibility: "public",
                            createdAt: "2019-08-13T09:57:08.837Z",
                            updatedAt: "2019-08-13T09:57:08.837Z",
                            name: "Test network",
                            gateways: 0
                        }
                    ]
                }
            });
            let networkList = await networks.get(0, 10);
            assert.equal(networkList.length, 1);
            assert.equal(networkList[0].getVisibleNetworkId(), "A00000FD");
        });
        it('Retrieves gateways for a network', async () => {
            let networks = new Networks(client);
            let stub = sinon.stub(server, 'request');
            stub.withArgs({
                url: '1/nwk/networks?page=1&perPage=10',
                method: 'GET',
                headers: {
                    Authorization: 'Session foobar'
                }
            }).returns({
                data: {
                    networks: [
                        {
                            _id: 2684354813,
                            userid: 1,
                            organizationId: 123,
                            visibility: "public",
                            createdAt: "2019-08-13T09:57:08.837Z",
                            updatedAt: "2019-08-13T09:57:08.837Z",
                            name: "Test network",
                            gateways: 0
                        }
                    ]
                }
            });
            stub.withArgs({
                url: '1/nwk/network/A00000FD/gateways?page=1&perPage=10',
                method: 'GET',
                headers: {
                    Authorization: 'Session foobar'
                }
            }).returns({
                data: {"total":1,"gateways":[{"_id":"010245FFFF678931","createdAt":"2019-08-13T11:56:39.431Z","title":"01-02-45-FF-FF-67-89-31","base":"pktfwd","model":"semtech","basename":"Packet Forwarder","modelname":"Semtech","version":"udp4.2","concentrator":"pktfwd","concentratorname":"Packet forwarder","bus":"UDP","card":0,"location":{"address":"Chemin des Buissons, 1","city":"Corminboeuf","zip":"1720","country":"CH","lat":46.8074478,"lon":7.1011634,"latProtected":46.8074478,"lonProtected":7.1011634,"coordinates":{"type":"Point","coordinates":[7.1011634,46.8074478]}},"MAC":"01:02:45:67:89:31","EUI":"01-02-45-FF-FF-67-89-31","visibility":"public","alerts":false,"connected":true,"lastData":"2019-08-13T22:43:10.667Z","lastStarted":"1970-01-01T00:00:00.000Z","lastPong":1565736190667,"radioband":"EU868_Semtech","autoUpdate":true}]}
            });
            let rtn_networks = await networks.get(0, 10);
            assert.equal(rtn_networks.length, 1);
            let gateways = await rtn_networks[0].gateways().get(0, 10);
            assert(gateways[0] instanceof Gateway);
            assert.equal(gateways[0].EUI, "01-02-45-FF-FF-67-89-31");
            assert.equal(gateways[0]._id, "010245FFFF678931");
        });
        it('Creates gateways on the network', async () => {
            let networks = new Networks(client);
            let stub = sinon.stub(server, 'request');
            stub.withArgs({
                url: '1/nwk/networks?page=1&perPage=10',
                method: 'GET',
                headers: {
                    Authorization: 'Session foobar'
                }
            }).returns({
                data: {
                    networks: [
                        {
                            _id: 2684354813,
                            userid: 1,
                            organizationId: 123,
                            visibility: "public",
                            createdAt: "2019-08-13T09:57:08.837Z",
                            updatedAt: "2019-08-13T09:57:08.837Z",
                            name: "Test network",
                            gateways: 0
                        }
                    ]
                }
            });
            stub.withArgs({
                url: '1/nwk/network/A00000FD/gateways',
                method: 'POST',
                data: {
                    MAC: '01:23:45:67:89:00',
                    base: 'pktfwd',
                    model: 'semtech',
                    location: {
                        city: 'Test city',
                        address: 'Test street',
                        zip: '1234',
                        lat: 2,
                        lon: 2,
                        country: 'NL'
                    }
                },
                headers: {
                    Authorization: 'Session foobar'
                }
            }).returns({
                data: 
                    {"_id":"ABCDEFFFFF123456","EUI":"AB-CD-EF-FF-FF-12-34-56","MAC":"AB:CD:EF:12:34:56","base":"pktfwd","model":"semtech"}
            });
            let n = await networks.get(0, 10);
            assert.rejects(n[0].gateways().create({
            }));
            assert.rejects(n[0].gateways().create({
                MAC: 'F0:00:00:00:B4:41'
            }));
            let gateway = await n[0].gateways().create({
                MAC: '01:23:45:67:89:00',
                base: 'pktfwd',
                model: 'semtech',
                location: {
                    city: 'Test city',
                    address: 'Test street',
                    zip: '1234',
                    lat: 2,
                    lon: 2,
                    country: 'NL'
                }
            });
            assert.equal(gateway._id, "ABCDEFFFFF123456");
        });
        it('Properly deletes networks', async () => {
            let networks = new Networks(client);
            let stub = sinon.stub(server, 'request');
            stub.withArgs({
                url: '1/nwk/networks?page=1&perPage=10',
                method: 'GET',
                headers: {
                    Authorization: 'Session foobar'
                }
            }).returns({
                data: {
                    networks: [
                        {
                            _id: 2684354813,
                            userid: 1,
                            organizationId: 123,
                            visibility: "public",
                            createdAt: "2019-08-13T09:57:08.837Z",
                            updatedAt: "2019-08-13T09:57:08.837Z",
                            name: "Test network",
                            gateways: 0
                        }
                    ]
                }
            });

            let rtn_networks = await networks.get(0, 10);
            await rtn_networks[0].delete();
            assert(stub.calledWith({
                url: '1/nwk/network/A00000FD',
                method: 'DELETE',
                headers: {
                    Authorization: 'Session foobar'
                }
            }));
        })
    });
    describe('Network creation', () => {
        it('Forces the correct validation', async () => {
            let networks = new Networks(client);
            
            let stub = sinon.stub(server, 'request');
            stub.withArgs({
                url: '1/nwk/networks',
                method: 'POST',
                data: {
                    name: 'foobar',
                    country: 'NL',
                    city: 'Almere',
                    lat: 52,
                    lon: 4,
                    zip: '1314AN',
                    address: 'Markerkant 13',
                    visibility: 'public'
                },
                headers: {
                    Authorization: 'Session foobar'
                }
            }).returns({
                data:
                    {"_id":2684354822,"visibility":"public","createdAt":"2019-08-17T15:03:26.167Z","updatedAt":null,"name":"test","address":"Chemin des Buissons, 1","city":"Corminboeuf","zip":"1720","country":"CH","lat":46.8076885,"lon":7.100528,"gateways":[]}
            });
            assert.rejects(networks.create());
            assert.rejects(networks.create({}));
            assert.rejects(networks.create({
                name: 'foobar'
            }));
            
            let new_net = await networks.create({
                name: 'foobar',
                country: 'NL',
                city: 'Almere',
                lat: 52,
                lon: 4,
                zip: '1314AN',
                address: 'Markerkant 13',
                visibility: 'public'
            });
            assert.equal(new_net.getVisibleNetworkId(), "A0000106");

        })
    })
});