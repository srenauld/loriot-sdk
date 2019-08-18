import Joi from '@hapi/joi';

export default {
    address: Joi.string().required(),
    city: Joi.string().required(),
    country: Joi.string().required(), // TODO: Add countries
    lat: Joi.number().required(),
    lon: Joi.number().required(),
    zip: Joi.string().required()
};