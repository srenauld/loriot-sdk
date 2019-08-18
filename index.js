import Session from "./src/transports/session";
import {Networks} from './src/networks';
import {Applications} from './src/applications';
import WSBroadcaster from './src/transports/websocket';
import Data from './src/data';
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
        returned = {
            ...returned,
            ...{
                Networks: new Networks(session),
               Applications: new Applications(session)
            }
        }
    }
    if (settings.token) {
        assert(settings.token.id, "When supplying a token, the token must be provided under the id key");
        assert(settings.token.applicationId, "When supplying a token, an applicationId must be provided");
        returned = {
            ...returned,
            ...{
                Data: Data.fromCredentials({
                    server: settings.server,
                    applicationId: settings.token.applicationId,
                    token: settings.token.id
                })
            }
        }
    }
    return returned;

}
export default loriot;