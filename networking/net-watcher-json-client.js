'use strict'
const net = require('net');
const client = net.connect({port: 60300});

/**
 * Client listener
 * @param event event type expected
 * @param function Parse the JSON files and show the correct message
 */
    client.on('data', data=>{
        const message = JSON.parse(data);
        if(message.type === 'watching'){
            console.log(`Now watching: ${message.file}`);
        }else if (message.type === 'changed'){
            console.log(`File changed: ${date}`);
        }else{
            console.log(`Unrecognised message type: ${message.type}`);
        }
});
