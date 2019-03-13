'use strict';
const assert = require('assert');
const EventEmitter = require('events').EventEmitter;
const LDJClient = require('../lib/ldj-client.js');

describe('LDJClient', () => {
  let stream = null;
  let client = null;

  beforeEach(() => {
    stream = new EventEmitter();
    client = new LDJClient(stream);
  });

  it('should emit a message event from a single data event', done => {
    client.on('message', message => {
      assert.deepEqual(message, {foo: 'bar'});    //Comprueba si son iguales
      done();
    });
    stream.emit('data', '{"foo":"bar"}\n');
  });
  //Testability pregunta 1
  it('should emit a message event from split data events', done => {
    client.on('message', message => {
      assert.deepEqual(message, { foo: 'bar' });
      done();
    });
    stream.emit('data', '{"foo');
    process.nextTick(() => stream.emit('data', '": "bar"}\n'));  //Se usa para diferir la 
            //ejecución de una función hasta la próxima iteración del bucle de eventos.
  });
  //Testability pregunta 2
  it('Se lanzara una excepcion cuando se le envia un null al constructor', done => {
    assert.throws(() => { //es un método para Node.js que verifica si se lanza una función síncrona o asíncrona.
      new LDJClient(null);
    });
    done();
  });
  it('Se lanzará una excepción cuando se le envía un mensaje que no es JSON', done => {
    assert.throws(() => {
      stream.emit('data', '{"foo\n');
    });
    done();
  });
  it('Se envían datos que contienen JSON pero no nueva línea', done => {
    client.on('message', message => {
      assert.deepEqual(message, { foo: 'bar' });
      done();
    });
    stream.emit('data', '{"foo": "bar"}');
    stream.emit('close');
});

});
