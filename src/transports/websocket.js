import InnerWS from 'ws';
import EE3 from 'eventemitter3';

export default class WebSocket {

    constructor(settings) {
        this.settings = settings;
        this.socket = null;
        this.emitter = new EE3();
        this.callbacks = [];
    }
    
    start() {
        if (!this.socket) this.socket = new InnerWS(`wss://${this.settings.server}.loriot.io/app?id=${this.settings.applicationId}&token=${this.settings.token}`);
        this.socket.on('message', (message) => {
            let msg = JSON.parse(message);
            if (msg && msg.cmd) {
                this.emitter.emit(msg.cmd, msg);
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

    async send(message) {
        if (!this.socket) this.start();
        return await this.socket.send(JSON.stringify(message))
    }
}