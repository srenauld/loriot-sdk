'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Joi = require('@hapi/joi');
var Immutable = _interopDefault(require('immutable'));
var ImmutableDiff = _interopDefault(require('immutablediff'));
require('path');
var InnerWS = _interopDefault(require('ws'));
var EE3 = _interopDefault(require('eventemitter3'));
var Axios = _interopDefault(require('axios'));
var assert = _interopDefault(require('assert'));

function _AwaitValue(value) {
  this.wrapped = value;
}

function _AsyncGenerator(gen) {
  var front, back;

  function send(key, arg) {
    return new Promise(function (resolve, reject) {
      var request = {
        key: key,
        arg: arg,
        resolve: resolve,
        reject: reject,
        next: null
      };

      if (back) {
        back = back.next = request;
      } else {
        front = back = request;
        resume(key, arg);
      }
    });
  }

  function resume(key, arg) {
    try {
      var result = gen[key](arg);
      var value = result.value;
      var wrappedAwait = value instanceof _AwaitValue;
      Promise.resolve(wrappedAwait ? value.wrapped : value).then(function (arg) {
        if (wrappedAwait) {
          resume("next", arg);
          return;
        }

        settle(result.done ? "return" : "normal", arg);
      }, function (err) {
        resume("throw", err);
      });
    } catch (err) {
      settle("throw", err);
    }
  }

  function settle(type, value) {
    switch (type) {
      case "return":
        front.resolve({
          value: value,
          done: true
        });
        break;

      case "throw":
        front.reject(value);
        break;

      default:
        front.resolve({
          value: value,
          done: false
        });
        break;
    }

    front = front.next;

    if (front) {
      resume(front.key, front.arg);
    } else {
      back = null;
    }
  }

  this._invoke = send;

  if (typeof gen.return !== "function") {
    this.return = undefined;
  }
}

if (typeof Symbol === "function" && Symbol.asyncIterator) {
  _AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
    return this;
  };
}

_AsyncGenerator.prototype.next = function (arg) {
  return this._invoke("next", arg);
};

_AsyncGenerator.prototype.throw = function (arg) {
  return this._invoke("throw", arg);
};

_AsyncGenerator.prototype.return = function (arg) {
  return this._invoke("return", arg);
};

function _wrapAsyncGenerator(fn) {
  return function () {
    return new _AsyncGenerator(fn.apply(this, arguments));
  };
}

function _awaitAsyncGenerator(value) {
  return new _AwaitValue(value);
}

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(source, true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(source).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

class Session {
  constructor(client, settings) {
    this.client = client;
    this.token = null;
    this.settings = settings;
  }

  signedIn() {
    var _this = this;

    return _asyncToGenerator(function* () {
      if (_this.token) return true;
      yield _this.signIn();
      return true;
    })();
  }

  signIn() {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      let signInRequest = yield _this2.client.post('1/pub/login', {
        user: _this2.settings.username,
        pwd: _this2.settings.password
      });

      if (signInRequest && signInRequest.data && signInRequest.data.session) {
        _this2.token = signInRequest.data.session;
        return true;
      }

      throw new Error("Could not log in to the Loriot back-office");
    })();
  }

  handle(cb) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      try {
        return yield cb();
      } catch (e) {
        if (e.response.status !== 403) throw e;
        yield _this3.signIn();
        return yield cb();
      }
    })();
  }

  get(url) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      yield _this4.signedIn();
      return yield _this4.handle(
      /*#__PURE__*/
      _asyncToGenerator(function* () {
        let request = {
          method: 'GET',
          url: url,
          headers: {
            Authorization: 'Session ' + _this4.token
          }
        };
        return yield _this4.client.request(request);
      }));
    })();
  }

  post(url, body, secondAttempt) {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      yield _this5.signedIn();
      return yield _this5.handle(
      /*#__PURE__*/
      _asyncToGenerator(function* () {
        let request = {
          method: 'POST',
          url: url,
          data: body,
          headers: {
            Authorization: 'Session ' + _this5.token
          }
        };
        return yield _this5.client.request(request);
      }));
    })();
  }

  delete(url, secondAttempt) {
    var _this6 = this;

    return _asyncToGenerator(function* () {
      yield _this6.signedIn();
      return yield _this6.handle(
      /*#__PURE__*/
      _asyncToGenerator(function* () {
        let request = {
          method: 'DELETE',
          url: url,
          headers: {
            Authorization: 'Session ' + _this6.token
          }
        };
        return yield _this6.client.request(request);
      }));
    })();
  }

}

var dataObj = ((schema, methods, settings = {}) => {
  let readOnlyFields = settings.readOnly || [];

  let primaryKeyFn = settings.primaryKey || (item => item._id);

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

    update() {
      var _this = this;

      return _asyncToGenerator(function* () {
        let diff = _this._diff();

        if (Object.keys(diff).length <= 0) return;
        return yield _this._client.update(primaryKeyFn(_this), diff);
      })();
    }

    delete() {
      var _this2 = this;

      return _asyncToGenerator(function* () {
        return yield _this2._client.delete(primaryKeyFn(_this2));
      })();
    }

    _diff() {
      let output = {};
      let newSettings = Immutable.Map(this.settings);
      let changes = ImmutableDiff(newSettings, this._settings); // Recreate a change object, making sure to strip read-only params

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

  }
  Object.entries(methods).forEach(([k, v]) => {
    DataObject.prototype[k] = v;
  });
  DataObject.schema = schema;

  DataObject.fromRaw = settings => {
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
});

var locationFormat = {
  address: Joi.string().required(),
  city: Joi.string().required(),
  country: Joi.string().required(),
  // TODO: Add countries
  lat: Joi.number().required(),
  lon: Joi.number().required(),
  zip: Joi.string().required()
};

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

  create(gatewaySettings) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
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
      let result = yield _this2._client.post(`1/nwk/network/${_this2._networkId}/gateways`, gatewaySettings);
      return Gateway.fromRaw(result.data).withClient(_this2);
    })();
  }

  get(page, toFetch) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      let results = yield _this3._client.get(`1/nwk/network/${_this3._networkId}/gateways?page=${page + 1}&perPage=${toFetch}`);
      return results.data.gateways.map(gateway => {
        return Gateway.fromRaw(gateway).withClient(_this3);
      });
    })();
  }

  all() {
    var _this = this;

    return _wrapAsyncGenerator(function* () {
      let done = false;
      let currentPage = 0;

      while (!done) {
        let results = yield _awaitAsyncGenerator(_this.get(currentPage, 10));

        if (!results.length) {
          done = true;
        }

        currentPage++;

        for (var i = 0; i < results.length; i++) yield results;
      }
    })();
  }

}

const schema$1 = Joi.object().keys({
  _id: Joi.number(),
  name: Joi.string().required(),
  address: Joi.string().allow(''),
  city: Joi.string().allow(''),
  zip: Joi.string().allow(''),
  country: Joi.string().allow(''),
  lat: Joi.number(),
  lon: Joi.number(),
  gateways: Joi.alternatives([Joi.number(), Joi.array()]),
  visibility: Joi.string(),
  userid: Joi.number(),
  organizationId: Joi.number(),
  updatedAt: Joi.date().allow(null),
  createdAt: Joi.date().allow(null)
});
let Network = dataObj(schema$1, {
  getVisibleNetworkId: function () {
    return this.settings._id.toString(16).toUpperCase();
  },
  gateways: function () {
    return new Gateways(this._client._client, this.getVisibleNetworkId());
  }
}, {
  primaryKey: item => item.getVisibleNetworkId(),
  readOnly: ['gateways', 'createdAt', 'updatedAt', 'userid', 'organizationId']
});

class Networks {
  constructor(client) {
    this._client = client;
    this._gateways = new Gateways(client);
  }

  get(page, toFetch) {
    var _this = this;

    return _asyncToGenerator(function* () {
      let results = yield _this._client.get(`1/nwk/networks?page=${page + 1}&perPage=${toFetch}`);
      return results.data.networks.map(network => Network.fromRaw(network).withClient(_this));
    })();
  }

  delete(networkId) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      let results = yield _this2._client.delete(`1/nwk/network/${networkId}`);
      return true;
    })();
  }

  create(data) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      let creationSchema = Joi.object(_objectSpread2({
        name: Joi.string().required()
      }, locationFormat, {
        visibility: Joi.string().valid(['public', 'private']).required()
      }));
      let validationResults = creationSchema.validate(data);
      if (validationResults.error) throw new Error(validationResults.error);
      let result = yield _this3._client.post('1/nwk/networks', data);
      return Network.fromRaw(result.data).withClient(_this3);
    })();
  }

}

const schema$2 = Joi.object().keys({
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
let Device = dataObj(schema$2, {}, {
  readOnly: ['_id', 'organizationId', 'seqno', 'seqdn', 'seqq', 'adrCnt', 'txrate', 'rxrate', 'rxw', 'rx1', 'dutycycle', 'seqrelax', 'seqdnreset', 'createdAt', 'bat', 'devSnr', 'lorawan', 'location', 'nonce', 'lastJoin', 'lastSeen', 'rssi', 'snr', 'freq', 'sf', 'bw', 'gw', 'ant', 'brd', 'lastDevStatusSeen']
});

class Devices {
  constructor(client, applicationId) {
    this._client = client;
    this._applicationId = applicationId;
  }

  get(page, toFetch) {
    var _this = this;

    return _asyncToGenerator(function* () {
      let results = yield _this._client.get(`1/nwk/app/${_this._applicationId}/devices?page=${page + 1}&perPage=${toFetch}`);
      return results.data.devices.map(network => Device.fromRaw(network).withClient(_this));
    })();
  }

  delete(deviceId) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      let results = yield _this2._client.delete(`1/nwk/app/${_this2._applicationId}/device/${deviceId}`);
      return true;
    })();
  }

  update(deviceId, diff) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      return yield _this3._client.post(`1/nwk/app/${_this3._applicationId}/device/${deviceId}`, diff);
    })();
  }

  create(data) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      let creationSchema = Joi.object().keys({
        deveui: Joi.string().required().regex(/^[0-9A-F]{16}$/),
        nwkskey: Joi.string().regex(/^[0-9A-F]{32}$/),
        appskey: Joi.string().regex(/^[0-9A-F]{32}$/),
        devclass: Joi.string().allow(['A', 'B', 'C'])
      });
      let validationResults = creationSchema.validate(data);
      if (validationResults.error) throw new Error(validationResults.error);
      let result = yield _this4._client.post(`1/nwk/app/${_this4._applicationId}/devices`, data);
      return Device.fromRaw(result.data).withClient(_this4);
    })();
  }

}

const schema$3 = Joi.object().keys({
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
let Application = dataObj(schema$3, {
  devices: function () {
    return new Devices(this._client._client, this.getApplicationId());
  },
  getApplicationId: function () {
    return this.settings._id.toString(16).toUpperCase();
  }
}, {
  primaryKey: item => item.getApplicationId(),
  readOnly: ['ownerid', 'organizationId', 'created', ' devices', 'deviceLimit', 'mcastdevices', 'mcastdevlimit', 'outputs', 'suspended', 'clientsLimit']
});

class Applications {
  constructor(client) {
    this._client = client;
    this._devices = new Devices(client);
  }

  get(page, toFetch) {
    var _this = this;

    return _asyncToGenerator(function* () {
      let results = yield _this._client.get(`1/nwk/apps?page=${page + 1}&perPage=${toFetch}`);
      return results.data.apps.map(app => Application.fromRaw(app).withClient(_this));
    })();
  }

  delete(appId) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      yield _this2._client.delete(`1/nwk/app/${appId}`);
      return true;
    })();
  }

  create(data) {
    return _asyncToGenerator(function* () {
      throw new Error("Creating applications is currently not implemented.");
    })();
  }

}

class WebSocket {
  constructor(settings) {
    this.settings = settings;
    this.socket = null;
    this.stopped = false;
    this.startedAt = null;
    this.emitter = new EE3();
    this.callbacks = [];
  }

  stop() {
    this.stopped = true;
    this.socket = null;
  }

  start() {
    if (this.stopped) return this;
    if (this.socket) return this;
    let currentTime = new Date().getTime();
    if (this.startedAt && currentTime - this.startedAt < 1000) throw Error("Websocket attempted to reconnect twice in < 1s. This is not normal, and may indicates network issues or incorrect credentials.");
    this.startedAt = currentTime;
    this.socket = new InnerWS(`wss://${this.settings.server}.loriot.io/app?id=${this.settings.applicationId}&token=${this.settings.token}`);
    this.socket.on('message', message => {
      let msg = JSON.parse(message);

      if (msg && msg.cmd) {
        this.emitter.emit(msg.cmd, msg);
      }
    });
    this.socket.on('close', () => {
      if (!this.stopped) {
        this.socket = null;
        this.start();
      }
    });
    return this;
  }

  on(event, listener) {
    this.emitter.on(event, listener);
    return this;
  }

  once(event, listener) {
    this.emitter.once(event, listener);
    return this;
  }

  removeListener(event, listener) {
    this.emitter.removeListener(event, listener);
    return this;
  }

  send(message) {
    var _this = this;

    return _asyncToGenerator(function* () {
      if (!_this.socket) _this.start();
      return yield _this.socket.send(JSON.stringify(message));
    })();
  }

}

class Data {
  constructor(socket) {
    this.socket = socket;
    this.events = {
      'gw': [],
      'rx': []
    };
    this.socket.on('rx', data => this.parse(data));
    this.socket.on('gw', data => this.parse(data));
  }

  close() {
    return this.socket && this.socket.stop();
  }

  parse(event) {
    var _this = this;

    return _asyncToGenerator(function* () {
      return event && event.cmd && _this.events[event.cmd] && (yield Promise.all(_this.events[event.cmd].filter(([eui, cb]) => {
        return event.EUI === eui || eui === false;
      }).map(
      /*#__PURE__*/
      function () {
        var _ref = _asyncToGenerator(function* ([eui, cb]) {
          return yield cb(event);
        });

        return function (_x) {
          return _ref.apply(this, arguments);
        };
      }())));
    })();
  }

  all(cb) {
    this.events.rx.push([false, cb]);
    return this;
  }

  gateway(eui, cb) {
    this.events.gw.push([eui, cb]);
  }

  device(eui, cb) {
    this.events.rx.push([eui, cb]);
    return this;
  }

  send(eui, payload, confirmed) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      return yield _this2.socket.send({
        cmd: 'tx',
        EUI: eui,
        port: 1,
        confirmed: confirmed == true,
        data: payload
      });
    })();
  }

}

Data.fromCredentials =
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(function* (credentials) {
    let socket = new WebSocket(credentials);
    yield socket.start();
    return new Data(socket);
  });

  return function (_x2) {
    return _ref2.apply(this, arguments);
  };
}();

let loriot = settings => {
  let returned = {};
  assert(settings.server, "A server must be provided (eu1, eu2...)");

  if (settings.credentials) {
    assert(settings.credentials.username, "When supplying credentials, a username must be provided");
    assert(settings.credentials.password, "When supplying credentials, a password must be provided");
    let client = Axios.create({
      baseURL: `https://${settings.server}.loriot.io`
    });
    let session = new Session(client, settings.credentials);
    let output = {
      Networks: new Networks(session),
      Applications: new Applications(session)
    };
    returned = _objectSpread2({}, returned, {}, output);
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
    returned = _objectSpread2({}, returned, {}, output);
  }

  return returned;
};

module.exports = loriot;
