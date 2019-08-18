import Immutable from 'immutable';
import ImmutableDiff from 'immutablediff';

export default (schema, methods, settings = {}) => {
    let readOnlyFields = settings.readOnly || [];
    let primaryKeyFn = settings.primaryKey || ((item) => item._id);
    class DataObject {

        constructor(settings) {
            this._client = null;
            this.settings = settings;
            this._validate();
            this._settings = Immutable.Map(settings);
        }

        withClient(client) {
            this._client = client;
            return this;
        }

        _validate() {
            let validationResults = schema.validate(this.settings);
            if (validationResults.error) throw new Error(validationResults.error);
            return true;
        }

        async update() {
            let diff = this._diff();
            if (Object.keys(diff).length < 0) return;
            return await this._client.update(primaryKeyFn(this), diff);
        }

        async delete() {
            return await this._client.delete(primaryKeyFn(this));
        }

        _diff() {
            let output = {};
            let newSettings = Immutable.Map(this.settings);
            let changes = ImmutableDiff(newSettings, this._settings);
            // Recreate a change object, making sure to strip read-only params
            for (var o of changes) {
                let path = o.get("path").split("/");
                path.shift();
                let first_node = path.shift();
                output[first_node] = JSON.parse(JSON.stringify(this.settings[first_node]));
            }
            for (var i in readOnlyFields) {
                delete output[i];
            }
            return output;
        }
    };
    Object.entries(methods).forEach( ([k, v]) => {
        DataObject.prototype[k] = v;
    });

    DataObject.schema = schema;

    DataObject.fromRaw = (settings) => {
        let obj = new DataObject(settings);
        let proxy = new Proxy(obj, {
            get: (obj, prop) => {
                if (obj[prop]) return obj[prop];
                return obj.settings[prop];
            },
            set: (obj, prop, value) => {
                if (obj[prop] !== undefined) {
                    return obj[prop] = value;
                }
                obj.settings[prop] = value;
                return obj._validate();
            }
        });
        return proxy;
    };
    return DataObject;
};