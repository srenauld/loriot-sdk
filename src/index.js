import Session from "./transports/session.js";
import {Networks} from './networks.js';
import {Applications} from './applications.js';
import WSBroadcaster from './transports/websocket.js';
import Data from './data.js';
import Axios from "axios";
import assert from 'assert';

let loriot = (settings) => {
    let returned = {};
    assert(settings.server, "A server must be provided (eu1, eu2...)");
    if (settings.credentials) {
        assert(settings.credentials.username, "When supplying credentials, a username must be provided");
        assert(settings.credentials.password, "When supplying credentials, a password must be provided");
        let client = Axios.create({
            baseURL: `https://${settings.server}.loriot.io`
        });
        let session = new Session(client, settings.credentials);
        let output = {
            Networks: new Networks(session),
           Applications: new Applications(session)
        };
        returned = {
            ...returned,
            ...output
        }
    }
    if (settings.token) {
        assert(settings.token.id, "When supplying a token, the token must be provided under the id key");
        assert(settings.token.applicationId, "When supplying a token, an applicationId must be provided");
        let output = {
            Data: Data.fromCredentials({
                server: settings.server,
                applicationId: settings.token.applicationId,
                token: settings.token.id
            })
        };
        returned = {
            ...returned,
            ...output
        }
    }
    return returned;

}
export default loriot;