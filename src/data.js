import WSH from './transports/websocket';

export default class Data {

    constructor(socket) {
        this.socket = socket;
        this.events = {
            'gw': [],
            'rx': []
        };
        this.socket.on('rx', (data) => this.parse(data));
        this.socket.on('gw', (data) => this.parse(data));
    }

    parse(event) {
        event && event.cmd && this.events[event.cmd] && this.events[event.cmd].filter(([eui, cb]) => event.EUI === eui).forEach(([eui, cb]) => cb(event));
    }

    device(eui, cb) {
        this.events.rx.push([eui, cb]);
        return this;
    }

    async send(eui, payload, confirmed) {
        return await this.socket.send({
            cmd: 'tx',
            EUI: eui,
            port: 1,
            confirmed: confirmed == true,
            data: payload
        });
    }
}
Data.fromCredentials = async (credentials) => {
    let socket = new WSH(credentials);
    await socket.start();
    return new Data(socket);
};