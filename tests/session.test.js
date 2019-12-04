import Session from '../src/transports/session.js';
import axios from 'axios';
import sinon from 'sinon';
import assert from 'assert';
process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
    // application specific logging, throwing an error, or other logic here
  });
describe('Session manager', () => {
    describe('Bearer token', () => {
        it('Accepts a bearer token', async () => {
            let server = axios.create({
                baseURL: 'https://eu2.loriot.io/'
            });
            let post_stub = sinon.stub(server, 'request')
            post_stub.returns({
                data: 'foo'
            });
            
            let client = new Session(server, "foobar");
            let result = await client.get('1/nwk/user');
            assert(post_stub.calledOnceWith({
                url: '1/nwk/user',
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer foobar'
                }
            }));
        })
    })
    describe('Login', () => {
        it('Notices that it is not signed in and logs you in', async () => {
            let server = axios.create({
                baseURL: 'https://eu2.loriot.io/'
            });
            let post_stub = sinon.stub(server, 'post')
            post_stub.returns({
                data: {
                    session: 'foobar'
                }
            });
            let client = new Session(server, {
                username: 'foo',
                password: 'bar'
            });
            await client.signedIn();
            assert(post_stub.calledOnceWith("1/pub/login", {
                user: "foo",
                pwd: "bar"
            }));
            assert.equal(await client.signedIn(), true);
        });
        it('Recognizes sign-in errors due to incorrect credentials', async () => {
            let server = axios.create({
                baseURL: 'https://eu2.loriot.io/'
            });
            let post_stub = sinon.stub(server, 'post');
            let client = new Session(server, {
                username: 'foo',
                password: 'bar'
            });
            // Simulate a 200 with an error
            post_stub.withArgs('1/pub/login', {
                user: 'foo',
                pwd: 'bar'
            }).returns({});

            try {
                await client.signIn();
                assert(false);
            } catch (e) {
                assert(true);
            };
        });
        it('Attempts to sign in again after a failure', async () => {
            let server = axios.create({
                baseURL: 'https://eu2.loriot.io/'
            });
            let post_stub = sinon.stub(server, 'post');
            let request_stub = sinon.stub(server, 'request');
            let client = new Session(server, {
                username: 'foo',
                password: 'bar'
            });
            // Simulate a successful login
            post_stub.withArgs('1/pub/login', {
                user: 'foo',
                pwd: 'bar'
            }).returns({
                data: {
                    session: 'foobar'
                }
            });
            // But an unsuccessful network retrieval.
            request_stub.withArgs({
                method: 'GET',
                url: '1/nwk/networks',
                headers: {
                    Authorization: 'Session foobar'
                }
            }).returns(new Promise((resolve, reject) => reject({
                response: {
                    status: 403
                }
            })));
            try {
                await client.get('1/nwk/networks');
                assert(false);
            } catch (e) {
                assert(post_stub.calledTwice);
            }
        });
        it('Immediately fails on true failure', async () => {
            let server = axios.create({
                baseURL: 'https://eu2.loriot.io/'
            });
            let post_stub = sinon.stub(server, 'post');
            let request_stub = sinon.stub(server, 'request');
            let client = new Session(server, {
                username: 'foo',
                password: 'bar'
            });
            client.token = 'foobar';
            // Simulate a successful login
            post_stub.withArgs('1/pub/login', {
                user: 'foo',
                pwd: 'bar'
            }).returns({
                data: {
                    session: 'foobar'
                }
            });
            // But an unsuccessful network retrieval.
            request_stub.withArgs({
                method: 'GET',
                url: '1/nwk/networks',
                headers: {
                    Authorization: 'Session foobar'
                }
            }).rejects({
                response: {
                    status: 400
                }
            });
            try {
                await client.get('1/nwk/networks');
                assert(false);
            } catch (e) {
                assert(post_stub.notCalled);
            }
        })
        it('Properly propagates sign-in errors', async (done) => {
            let server = axios.create({
                baseURL: 'https://eu2.loriot.io/'
            });
            let post_stub = sinon.stub(server, 'post')
            post_stub.throws(new Error("Request failed"));
            
            let client = new Session(server, {
                username: 'foo',
                password: 'bar'
            });
            try {
                await client.signIn();
            } catch (e) {
                done();
            }
        });
        it('Wraps GET and POST with the expected session header', async () => {
            let server = axios.create({
                baseURL: 'https://eu2.loriot.io/'
            });
            let post_stub = sinon.stub(server, 'request')
            post_stub.returns({
                data: 'foo'
            });
            
            let client = new Session(server, {
                username: 'foo',
                password: 'bar'
            });
            client.token = {
                type: 'Session',
                value: 'foobar'
            };
            let result = await client.get('1/nwk/user');
            assert(post_stub.calledOnceWith({
                url: '1/nwk/user',
                method: 'GET',
                headers: {
                    'Authorization': 'Session foobar'
                }
            }));
        });
    })
});