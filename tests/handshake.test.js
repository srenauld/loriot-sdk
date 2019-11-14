let SDK = require('../src/index.js');
import assert from 'assert';
describe('Loriot SDK initialization', () => {
    it('should allow the user to supply a token', () => {
        const token = "vgEA4gAAAA1ldTIubG9yaW90LmlvOZB3czWamEix9KJbRLCXpw==";
        let parsed = SDK.parseToken(token);
        assert.deepStrictEqual({
            server: 'eu2.loriot.io',
            appId: 'BE0100E2',
            token: token
        }, parsed);

        const invalidToken = "foobar";
        assert.throws( () => {
            SDK.parseToken(invalidToken)
        });
    });
    it('should allow the user to instantiate from a token', async () => {
        let threw = false;
        try {
            let failedOutput = await SDK.fromToken("foobar");
        } catch (e) {
            threw = true;
        }
        assert.equal(threw, true);
        let output = await SDK.fromToken("vgEA4gAAAA1ldTIubG9yaW90LmlvOZB3czWamEix9KJbRLCXpw==");
        assert(output !== null);
    });
});