import Socket from './websocket.js';

export default class Session {

    constructor(client, settings) {
        this.client = client;
        this.token = null;
        this.settings = settings;
    }

    async signedIn() {
        if (this.token) return true;
        await this.signIn();
        return true;
    }

    async signIn() {
        let signInRequest = await this.client.post(
            '1/pub/login',
            {
                user: this.settings.username,
                pwd: this.settings.password
            }
        );
        if (signInRequest && signInRequest.data && signInRequest.data.session) {
            this.token = signInRequest.data.session;
            return true;
        }
        throw new Error("Could not log in to the Loriot back-office");
    }
    
    async get(url, secondAttempt) {
        await this.signedIn();
        let request = {
            method: 'GET',
            url: url,
            headers: {
                Authorization: 'Session ' + this.token,
            }
        };
        try {
            return await this.client.request(request);
        } catch (e) {
            console.log({
                url: url,
                status: e.response.status
            });
            if (secondAttempt || e.response.status !== 403) throw e;
            await this.signIn();
            return await this.get(url, true);
        }
    }
    
    async post(url, body, secondAttempt) {
        await this.signedIn();
        let request = {
            method: 'POST',
            url: url,
            data: body,
            headers: {
                Authorization: 'Session ' + this.token
            }
        };
        try {
            return await this.client.request(request);
        } catch (e) {
            console.log({
                url: url,
                status: e.response.status
            });
            if (secondAttempt || e.response.status !== 403) {
                console.log(e);
                throw e;
            }
            await this.signIn();
            return await this.post(url, body, true);
        }
    }
    async delete(url, secondAttempt) {
        await this.signedIn();
        let request = {
            method: 'DELETE',
            url: url,
            headers: {
                Authorization: 'Session ' + this.token
            }
        };
        try {
            return await this.client.request(request);
        } catch (e) {
            console.log({
                url: url,
                status: e.response.status
            });
            if (secondAttempt || e.response.status !== 403) throw e;
            await this.signIn();
            return await this.delete(url, true);
        }
    }
}