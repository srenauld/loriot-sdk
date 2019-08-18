
import dataObj from './dataObject';
import Joi from '@hapi/joi';

const schema = Joi.object().keys({
    _id: Joi.string().regex(/^[0-9A-F]{16}$/),
    title: Joi.string(),
    description: Joi.string().allow(null),
    appeui: Joi.string().regex(/^[0-9A-F]{16}$/),
    organizationId: Joi.number(),
    visibility: Joi.string().valid(['visible', 'private']),
    deveui: Joi.string().regex(/^[0-9A-F]{16}$/),
    devaddr: Joi.string().regex(/^[0-9A-F]{8}$/),
    seqno: Joi.number(),
    seqdn: Joi.number(),
    seqq: Joi.number(),
    adrCnt: Joi.number(),
    txrate: Joi.any().allow(null),
    rxrate: Joi.any().allow(null),
    devclass: Joi.string().valid(['A', 'B', 'C']),
    rxw: Joi.number().allow(null),
    nwkskey: Joi.string().regex(/^[0-9A-F]{32}$/),
    appskey: Joi.string().regex(/^[0-9A-F]{32}$/),
    appkey: Joi.string().regex(/^[0-9A-F]{32}$/),
    rx1: Joi.object().allow(null),
    dutycycle: Joi.number(),
    adr: Joi.boolean(),
    adrMin: Joi.any().allow(null),
    adrMax: Joi.any().allow(null),
    adrFix: Joi.any().allow(null),
    seqrelax: Joi.boolean(),
    seqdnreset: Joi.boolean(),
    createdAt: Joi.date(),
    bat: Joi.any().allow(null),
    devSnr: Joi.any().allow(null),
    packetLimit: Joi.number().allow(null),
    lorawan: Joi.object().allow(null),
    decodeTemplate: Joi.any().allow(null),
    canSend: Joi.boolean(),
    canSendFOPTS: Joi.boolean(),
    canSendPayload: Joi.boolean(),
    location: Joi.object().allow(null),
    nonce: Joi.number(),
    lastJoin: Joi.date(),
    lastSeen: Joi.number(),
    rssi: Joi.number(),
    snr: Joi.number(),
    freq: Joi.number(),
    sf: Joi.number(),
    bw: Joi.number(),
    gw: Joi.string().regex(/^[0-9A-F]{16}$/),
    ant: Joi.number(),
    brd: Joi.number(),
    lastDevStatusSeen: Joi.date()
});

let Device = dataObj(schema, {
}, {
    readOnly: [
        '_id',
        'organizationId',
        'seqno',
        'seqdn',
        'seqq',
        'adrCnt',
        'txrate',
        'rxrate',
        'rxw',
        'rx1',
        'dutycycle',
        'seqrelax',
        'seqdnreset',
        'createdAt',
        'bat',
        'devSnr',
        'lorawan',
        'location',
        'nonce',
        'lastJoin',
        'lastSeen',
        'rssi',
        'snr',
        'freq',
        'sf',
        'bw',
        'gw',
        'ant',
        'brd',
        'lastDevStatusSeen'
    ]
});

class Devices {

    constructor(client, applicationId) {
        this._client = client;
        this._applicationId = applicationId;
    }

    async get(page, toFetch) {
        let results = await this._client.get(`1/nwk/app/${this._applicationId}/devices?page=${page+1}&perPage=${toFetch}`);
        return results.data.devices.map( (network) => Device.fromRaw(network).withClient(this));
    }

    async delete(deviceId) {
        let results = await this._client.delete(`1/nwk/app/${this._applicationId}/device/${deviceId}`);
        return true;
    }

    async update(deviceId, diff) {
        return await this._client.post(`1/nwk/app/${this._applicationId}/device/${deviceId}`, diff);
    }

    async create(data) {

        let creationSchema = Joi.object().keys({
            deveui: Joi.string().required().regex(/^[0-9A-F]{16}$/),
            nwkskey: Joi.string().regex(/^[0-9A-F]{32}$/),
            appskey: Joi.string().regex(/^[0-9A-F]{32}$/),
            devclass: Joi.string().allow(['A','B','C'])
        });

        let validationResults = creationSchema.validate(data);
        if (validationResults.error) throw new Error(validationResults.error);

        let result = await this._client.post(`1/nwk/app/${this._applicationId}/devices`, data);
        return Device.fromRaw(result.data).withClient(this);
    }
}

export {Device, Devices};