The (unofficial) LORIOT SDK
------------

LORIOT provides a great service as a LoRa back-office. However, 
outside of the well-documented websocket transport to communicate 
with your LoRa devices, everything had to be done manually. Network 
and application set-up, device provisioning, all that was undocumented.

I needed to do something about this for a project, as setting up a 
large amount of LoRa devices would be too time-consuming. It is 
entirely unofficial for now, but allows programmatic access to all 
the parts of the API that you can find in the dashboard.

# Features / Roadmap

The library currently supports the following use cases:

[x] Networks
  [x] Listing
  [x] Creation
  [x] Modification
  [x] Deletion

[x] Gateways (per network)
  [x] Listing
  [x] Creation (Currently no final list of possible makes/models)
  [x] Deletion
  [x] Modification

[x] Applications
  [x] Listing
  [_] Creation
  [_] Modification
  [_] Deletion

[x] Devices (per application)
  [x] Listing
  [x] Creation
  [x] Modification
  [x] Deletion

[x] Device events (via WebSocket)
[x] Gateway events (via WebSocket)

Additional use cases are welcome, as are pull requests. In particular, 
the statistics and events for devices and gateways are of particular 
interest. Due to lack of data, however, they were left for later.

# Initialization

To be able to interact with LORIOT, two possible sets of credentials can 
be provided:

- Your account `username` and `password`. This will enable all the 
management API (as there is currently no other authorization mechanism 
that allows access to this). Enables: `Networks`, `Applications`.
- An `applicationID` and `token`. This allows access to the websocket 
events for the application provided. Enables: `Data`.

**Accessing applications and provisioning devices**

Suppose that you are providing a service to a number of third-parties and 
need to provision and decomission devices. A typical use-case would be 
the provisioning: you have their device EUI, and you need to do the rest.

A simple example of how to do this is as follows:

    import SDK from 'loriot-sdk';
    let client = SDK({
        username: 'foo@bar.com',
        password: 'foobar'
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

# Limitations

Currently, even though every component and dependency is designed to 
also work in most browsers, due to the lack of CORS headers on the 
LORIOT API, this library is only usable server-side.