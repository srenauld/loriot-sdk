import Loriot from '../src/index.js';
import assert from 'assert';

jest.mock('axios', () => {
    return {
        create: function(mockSettings) {
            return mockSettings;
        }
    };
});

describe('# Loriot()', () => {
    it('Properly parses tokens', () => {
        assert.throws(() => {
            Loriot.parseToken('abcd');
        });
        assert.throws(() => {
            Loriot.parseToken('***');
        });
        assert.throws(() => {
            Loriot.parseToken('vgEA4gAAAA1ldTIubG9yaW90');
        });
        assert.doesNotThrow(() => {
            Loriot.parseToken('vgEA4gAAAA1ldTIubG9yaW90LmlvOZB3czWamEix9KJbRLCXpw==');
        })
    })
    it('Accepts a token', async () => {
        let object = await Loriot.fromToken('vgEA4gAAAA1ldTIubG9yaW90LmlvOZB3czWamEix9KJbRLCXpw==');
        assert(object.Applications);
        assert.equal(object.Applications._client.client.baseURL, "https://eu2.loriot.io");
    })
    it('Accepts a username and password', async () => {
        assert.throws(() => {
            Loriot({
                server: 'eu1',
                credentials: {
                    'username': 'foo'
                }
            })
        })
        assert.throws(() => {
            Loriot({
                server: 'eu1',
                credentials: {
                    'password': 'foo'
                }
            })
        });
        assert.doesNotThrow(() => {
            let obj = Loriot({
                server: 'eu1',
                credentials: {
                    'password': "foo",
                    'username': "bar"
                }
            });
            assert.equal(obj.Applications._client.client.baseURL, "https://eu1.loriot.io");
        })
    })
})