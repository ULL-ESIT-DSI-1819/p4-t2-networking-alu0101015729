'use strict';
const EventEmitter = require('events').EventEmitter;
/**
 * Para crear la clase LDJClient.
 * @name LDJClient que extiende de la clase EventEmitter
 */
class LDJClient extends EventEmitter {
     /**
 * Constructor de la clase.
 * @name constructor
 * @param stream
 */
    constructor(stream) {
        //Testability pregunta 3
        if (stream === null)
            throw new Error('Stream parameter is null, check input.');
        super();
        let buffer = '';
        stream.on('data', data => {
            buffer += data;
            let boundary = buffer.indexOf('\n');
            while (boundary !== -1) {
                const input = buffer.substring(0, boundary);
                buffer = buffer.substring(boundary + 1);
                this.emit('message', JSON.parse(input));
                boundary = buffer.indexOf('\n');
            }
        }); 
    }
     /**
   * Para conectarse el cliente.
   * @param stream
   * @returns {LDJClient} objeto de la clase
  */
    static connect(stream) {
        return new LDJClient(stream);
    }
}

module.exports = LDJClient;