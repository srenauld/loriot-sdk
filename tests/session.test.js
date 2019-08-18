import Session from '../src/transports/session.js';
import axios from 'axios';
import sinon from 'sinon';
import assert from 'assert';

describe('Session manager', () => {
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
            client.token = 'foobar';
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