import Session from "./transports/session.js";
import {Networks} from './networks.js';
import {Applications} from './applications.js';
import WSBroadcaster from './transports/websocket.js';
import Data from './data.js';
import Axios from "axios";
import assert from 'assert';
import base64 from 'binary-base64';

function toHexString(byteArray) {
    return Array.from(byteArray, function(byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('')
}
function uint32be(bytes) {
    return bytes.reverse().reduce( ([multiplier, currentTotal], amount) => {
        return [
            multiplier * 256,
            currentTotal + multiplier * amount
        ]
    }, [1, 0])[1];
}

const Loriot = function(settings) {
    let returned = {};
    if (settings && settings.token && typeof settings.token === "string") {
        let token = settings.token.toString();
        let parsed = Loriot.parseToken(token);
        assert(parsed, "When supplying a token as a string, the token must be valid");
        settings.token = {
            applicationId: parsed.appId,
            id: token
        };
        settings.server = parsed.server;
        return Loriot(settings);
    }
    assert(settings.server, "A server must be provided (eu1, eu2...)");
    
    if (settings.server.indexOf(".") < 0) {
        settings.server = settings.server + ".loriot.io";
        return Loriot(settings);
    }

    if (settings.credentials) {
        assert(settings.credentials.username, "When supplying credentials, a username must be provided");
        assert(settings.credentials.password, "When supplying credentials, a password must be provided");
        let client = Axios.create({
            baseURL: `https://${settings.server}`
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
Loriot.prototype = {};

Loriot.parseToken = function(token) {
    let parsed = base64.decode(token.replace("-", "+").replace("_", "/"));
    if (!parsed) throw Error("Token was not valid base64");
    if (parsed.length < 8) throw Error("Token was not long enough to be a valid LORIOT token");
    let appId = toHexString(parsed.slice(0, 4)).toUpperCase();
    let urlLength = uint32be(parsed.slice(4, 8));
    let finalUrlItem = 8 + urlLength;
    if (parsed.length <= finalUrlItem) throw Error("Token was too short to contain a valid FQDN of a LORIOT server");
    let url = Buffer.from(parsed.slice(8, finalUrlItem)).toString();
    return {
        appId: appId,
        server: url,
        token: token
    };
};
Loriot.fromToken = async (token) => {
    return await Loriot({
        token: token
    })
};
module.exports = Loriot;