import { Gateway, Gateways } from './gateways.js';
import dataObj from './dataObject.js';
import * as Joi from '@hapi/joi';
import { join } from 'path';
import locationFormat from './formats/location.js';

const schema = Joi.object().keys({
    _id: Joi.number(),
    name: Joi.string().required(),
    address: Joi.string().allow(''),
    city: Joi.string().allow(''),
    zip: Joi.string().allow(''),
    country: Joi.string().allow(''),
    lat: Joi.number(),
    lon: Joi.number(),
    gateways: Joi.alternatives([
        Joi.number(),
        Joi.array()
    ]),
    visibility: Joi.string(),
    userid: Joi.number(),
    organizationId: Joi.number(),
    updatedAt: Joi.date().allow(null),
    createdAt: Joi.date().allow(null)
});

let Network = dataObj(schema, {
    getVisibleNetworkId: function() {
        return (this.settings._id).toString(16).toUpperCase();
    },
    gateways: function() {
        return new Gateways(this._client._client, this.getVisibleNetworkId());
    }
}, {
    primaryKey: (item) => item.getVisibleNetworkId(),
    readOnly: ['gateways', 'createdAt', 'updatedAt', 'userid', 'organizationId']
});

class Networks {

    constructor(client) {
        this._client = client;
        this._gateways = new Gateways(client);
    }
    
    async get(page, toFetch) {
        let results = await this._client.get(`1/nwk/networks?page=${page+1}&perPage=${toFetch}`);
        return results.data.networks.map( (network) => Network.fromRaw(network).withClient(this));
    }
    async delete(networkId) {
        let results = await this._client.delete(`1/nwk/network/${networkId}`);
        return true;
    }

    async create(data) {
        let creationSchema = Joi.object({
            name: Joi.string().required(),
            ... locationFormat,
            visibility: Joi.string().valid(['public', 'private']).required()
        });
        let validationResults = creationSchema.validate(data);
        if (validationResults.error) throw new Error(validationResults.error);

        let result = await this._client.post('1/nwk/networks', data);
        return Network.fromRaw(result.data).withClient(this);
    }
}

export {Network, Networks};