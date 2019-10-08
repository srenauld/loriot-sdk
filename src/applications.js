
import * as Joi from '@hapi/joi';
import dataObj from './dataObject.js';
import { Devices } from './devices.js';

const schema = Joi.object().keys({
    _id: Joi.number(),
    name: Joi.string().required(),
    ownerid: Joi.number(),
    organizationId: Joi.number(),
    owneremail: Joi.string(),
    visibility: Joi.string().allow(['public', 'private']),
    created: Joi.date(),
    devices: Joi.number(),
    deviceLimit: Joi.number(),
    mcastdevices: Joi.number(),
    mcastdevlimit: Joi.number(),
    outputs: Joi.array(),
    overbosity: Joi.string(),
    odataenc: Joi.string(),
    ogwinfo: Joi.string(),
    orx: Joi.boolean(),
    cansend: Joi.boolean(),
    canotaa: Joi.boolean(),
    suspended: Joi.boolean(),
    masterkey: Joi.string(),
    clientsLimit: Joi.number(),
    cfgDevBase: Joi.object(),
    joinServer: Joi.string().allow(null),
    publishAppSKey: Joi.boolean(),
    accessRights: Joi.array()
});

let Application = dataObj(schema, {
    devices: function() {
        return new Devices(this._client._client, this.getApplicationId());
    },
    getApplicationId: function() {
        return (this.settings._id).toString(16).toUpperCase();
    }
}, {
    primaryKey: (item) => item.getApplicationId(),
    readOnly: ['ownerid', 'organizationId', 'created',' devices', 'deviceLimit', 'mcastdevices', 'mcastdevlimit', 'outputs', 'suspended', 'clientsLimit']
});

class Applications {

    constructor(client) {
        this._client = client;
        this._devices = new Devices(client);
    }

    async get(page, toFetch) {
        let results = await this._client.get(`1/nwk/apps?page=${page+1}&perPage=${toFetch}`);
        return results.data.apps.map( (app) => Application.fromRaw(app).withClient(this));
    }

    async delete(appId) {
        await this._client.delete(`1/nwk/app/${appId}`);
        return true;
    }

    async create(data) {
        throw new Error("Creating applications is currently not implemented.");
    }
}

export {Application, Applications};