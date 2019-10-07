
# The NodeJS LORIOT SDK

[![LORIOT logo](https://docs.loriot.io/download/attachments/1245208/Loriot%20logo%20end_new.png?version=1&modificationDate=1566484185656&api=v2 | width=400)

[![Build Status](https://travis-ci.org/srenauld/loriot-sdk.svg?branch=master)](https://travis-ci.org/srenauld/loriot-sdk) [![Coverage Status](https://coveralls.io/repos/github/srenauld/loriot-sdk/badge.svg?branch=master)](https://coveralls.io/github/srenauld/loriot-sdk?branch=master) 

This library provides a convenient wrapper around most of the 
APIs exposed by the LORIOT back-office, both on the free usage tier and 
professional versions. It aims to ease the pain commonly encountered and to 
reduce  development time by providing an abstraction layer of the raw APIs.

This encompasses both the management APIs used to add resources (gateways or 
sensors), and the realtime data socket.

## Features / Roadmap

The library currently supports the following use cases:

- [x] Networks
  - [x] Listing
  - [x] Creation
  - [x] Modification
  - [x] Deletion

- [x] Gateways (per network)
  - [x] Listing
  - [x] Creation (Currently no final list of possible makes/models)
  - [x] Deletion
  - [x] Modification

- [x] Applications
  - [x] Listing
  - [ ] Creation
  - [ ] Modification
  - [ ] Deletion

- [x] Devices (per application)
  - [x] Listing
  - [x] Creation
  - [x] Modification
  - [x] Deletion

- [x] Device events (via WebSocket)
- [x] Gateway events (via WebSocket)

Additional use cases are welcome, as are pull requests. In particular, 
the statistics and events for devices and gateways are of particular 
interest. Due to lack of data, however, they were left for later.

## Initialization

To be able to interact with LORIOT, two possible sets of credentials can 
be provided:

- Your account `username` and `password`. This will enable all the 
management API (as there is currently no other authorization mechanism 
that allows access to this). Enables: `Networks`, `Applications`.
- An `applicationId` and `token`. This allows access to the websocket 
events for the application provided. Enables: `Data`.

### Accessing applications and provisioning devices

Suppose that you are providing a service to a number of third-parties and 
need to provision and decomission devices. A typical use-case would be 
the provisioning: you have their device EUI, and you need to do the rest.

A simple example of how to do this is as follows:

    import SDK from 'loriot-sdk';
    let client = SDK({
        server: 'eu2',
        credentials: {
            username: 'foo@bar.com',
            password: 'foobar'
        }
    });
    let applications = await client.Applications().get(0, 10);
    let newDevice = await applications[0].devices().create({
        deveui: '0102030405060708',
        devclass: 'C'
    });
    // These are the device's keys.
    //
    // You could also have specified them in the call to `create()`
    // if they are not present, LORIOT wil lgenerate a pair for you.
    console.log(newDevice.nwkskey);
    console.log(newDevice.appskey);
    console.log(newDevice.appKey);

### Accessing realtime updates from devices

Being able to receive messages from either gateways (status updates) or sensors 
(messages) is also straightforward, as is being able to enqueue messages for 
delivery. The following snippet highlights both of those:

    import SDK from 'loriot-sdk';
    let client = SDK({
        server: 'eu2',
        applicationId: 'foo',
        token: 'bar'
    });

    client.Data.device('FOOBAR', async (message) => {
        console.log("Received message for device EUI FOOBAR");
        // We're going to send a confirmed message
        await client.Data.send("FOOBAR", "01", true);
    })

Websocket reconnection is handled internally; do not forget to call 
`close()`. A limit of one connection attempt per second is also built in,
and the library will actively throw an `Error` should this situation occur.

## Limitations

Currently, even though every component and dependency is designed to 
also work in most browsers, due to the lack of CORS headers on the 
LORIOT API, this library is only usable server-side.
