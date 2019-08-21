import Joi from '@hapi/joi';
import dataObject from '../src/dataObject.js';
import assert from 'assert';

describe('DataObject', () => {
    it('Properly allows the creation of an object from a schema', async () => {
        let schema = Joi.object({
            _id: Joi.number().required(),
            bar: Joi.string().regex(/^[a-z]+$/)
        });

        let object = dataObject(schema, {});

        let dataTest = object.fromRaw({
            _id: 1234,
            bar: 'test'
        });
        
        assert.equal(await dataTest.update(), null);
        assert.throws(() => {
            dataTest.bar = 1;
        })
    })
})