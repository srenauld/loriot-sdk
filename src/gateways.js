import * as Joi from '@hapi/joi';
import dataObj from './dataObject.js';
import locationFormat from './formats/location.js';

const schema = Joi.object().keys({
    _id: Joi.string(),
    title: Joi.string(),
    modelname: Joi.string(),
    version: Joi.string(),
    concentratorname: Joi.string(),
    EUI: Joi.string().required(),
    base: Joi.string(),
    bus: Joi.string(),
    card: Joi.number(),
    concentrator: Joi.string(),
    location: Joi.object(),
    visibility: Joi.string(),
    connected: Joi.boolean(),
    MAC: Joi.string().regex(/^[0-9A-F]{2}:[0-9A-F]{2}:[0-9A-F]{2}:[0-9A-F]{2}:[0-9A-F]{2}:[0-9A-F]{2}$/).required(),
    model: Joi.string(),
    alerts: Joi.boolean(),
    lastStarted: Joi.date(),
    lastData: Joi.date(),
    lastPong: Joi.date(),
    radioband: Joi.string(),
    autoUpdate: Joi.boolean(),
    createdAt: Joi.date(),
    basename: Joi.string()
});

let Gateway = dataObj(schema, {}, {
    readOnly: ['lastStarted', 'lastData', 'lastPong', 'alerts', 'connected', 'autoUpdate', 'createdAt']
});

class Gateways {

    constructor(client, networkId) {
        this._client = client;
        this._networkId = networkId;
    }

    async create(gatewaySettings) {
        let creationSchema = Joi.object({
            base: Joi.string().required(),
            bus: Joi.string(),
            card: Joi.string(),
            concentrator: Joi.string(),
            location: Joi.object(locationFormat),
            MAC: Joi.string().regex(/^[0-9A-F]{2}:[0-9A-F]{2}:[0-9A-F]{2}:[0-9A-F]{2}:[0-9A-F]{2}:[0-9A-F]{2}$/).required(),
            model: Joi.string().required()
        });
        let validationResults = creationSchema.validate(gatewaySettings);
        if (validationResults.error) throw new Error(validationResults.error);
        let result = await this._client.post(`1/nwk/network/${this._networkId}/gateways`, gatewaySettings);
        return Gateway.fromRaw(result.data).withClient(this);
    }

    async get(page, toFetch) {
        let results = await this._client.get(`1/nwk/network/${this._networkId}/gateways?page=${page+1}&perPage=${toFetch}`);
        return results.data.gateways.map( (gateway) => {
            return Gateway.fromRaw(gateway).withClient(this);
        });
    }

    async *all() {
        let done = false;
        let currentPage = 0;
        while (!done) {
            let results = await this.get(currentPage, 10);
            if (!results.length) {
                done = true;
            }
            currentPage++;
            for (var i = 0; i < results.length; i++) yield results;
        }
    }

}
export {Gateway, Gateways};