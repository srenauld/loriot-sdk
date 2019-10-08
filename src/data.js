import WSH from './transports/websocket.js';

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

    close() {
        return this.socket && this.socket.stop();
    }
    async parse(event) {
        return event && event.cmd && this.events[event.cmd] && await Promise.all(
            this.events[event.cmd]
                .filter(([eui, cb]) => {
                    return event.EUI === eui || eui === false;
                })
                .map( async ([eui, cb]) => await cb(event))
            );
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