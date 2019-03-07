# p4-t2-networking-alu0101015729
# Binding A Server To A TCP Port 
TCP socket connections consist of two endpoints. One endpoint binds to a numbered port while the other endpoint connects to a port.
In Node.js, the bind and connect operations are provided by the net module.Binding a TCP port to listen for connections looks like this:
```javascript
    'use strict';
    const net = require('net'),
    server = net.createServer(connection => {
      // Use the connection object for data transfer.
    });
    server.listen(60300);
```
The net.createServer method takes a callback function and returns a Server object.Node.js will invoke the callback function whenever another endpoint connects.The connection parameter is a Socket object that you can use to send or receive data.
Calling server.listen binds the specified port. In this case, we’re binding TCP port number 60300. To get an idea of the setup, take a look at the figure.The figure shows our one Node.js process whose server binds a TCP port.Any number of clients—which may or may not be Node.js processes—can connect to that bound port.
# captura
# Writing Data To A Socket
At the top, we pull in the Node.js core modules fs and net.The name of the file to watch, if supplied, will be the third (index 2) argument in process.argv.If the user didn’t supply a target file to watch, then we throw a custom Error.
Now let’s take a look inside the callback function given to createServer.This callback function does three things:It reports that the connection has been established (both to the client with connection.write and to the console).It begins listening for changes to the target file, saving the returned watcher object.This callback sends change information to the client using connection.write.It listens for the connection’s close event so it can report that the subscriber has disconnected and stop watching the file, with watcher.close.Finally, notice the callback passed into server.listen at the end.Node.js invokes this function after it has successfully bound port 60300 and is ready to start receiving connections.

# Connecting to a TCP Socket Server with Netcat
To run and test the net-watcher program, you’ll need three terminal sessions: one for the service itself, one for the client, and one to trigger changes to the watched file.
In your first terminal, use the watch command to touch the target file at one-second intervals:           
```javascript
    $ watch -n 1 touch target.txt
```
With that running, in a second terminal, run the net-watcher program:
```javascript
    $ node net-watcher.js target.txt 
```
This program creates a service listening on TCP port 60300.To connect to it, we’ll use netcat, a socket utility program.Open a third terminal and use the nc command like so:
```javascript
$ nc localhost 60300
```
El resultado quedara algo como esto:
# captura
The net-watcher process (box) binds a TCP port and watches a file—both resources are shown as ovals.Multiple subscribers can connect and receive updates simultaneously.If you open additional terminals and connect to port 60300 with nc, they’ll all receive updates when the target file changes.TCP sockets are useful for communicating between networked computers.But if you need processes on the same computer to communicate, Unix sockets offer a more efficient alternative.
# Listening on Unix Sockets
To see how the net module uses Unix sockets, let’s modify the net-watcher program to use this kind of communication channel.Keep in mind that Unix sockets work only on Unix-like environments.
# Implementing a Messaging Protocol
In this section we’ll design and implement a better protocol.A protocol is a set of rules that defines how endpoints in a system communicate.Any time you develop a networked application in Node.js, you’re working with one or more protocols.Here we’ll create a protocol based on passing JSON messages over TCP.JSON is incredibly prevalent in Node.js.We’ll use it extensively for data serialization and configuration throughout the book.
# Serializing Messages with JSON
 Let’s develop the message-passing protocol that uses JSON to serialize messages. Each message is a JSON-serialized object, which is a hash of key-value pairs. Here’s an example JSON object with two key-value pairs:
 	
    {"key":"value","anotherKey":"anotherValue"}

The net-watcher service we’ve been developing in this chapter sends two kinds of messages that we need to convert to JSON:

   When the connection is first established, the client receives the string Now watching "target.txt" for changes.... We’ll encode the first kind of message this way:
 	
    {"type":"watching","file":"target.txt"}

The type field indicates that this is a watching message—the specified file is now being watched.

   Whenever the target file changes, the client receives a string like this: File changed: Fri Dec 18 2015 05:44:00 GMT-0500 (EST). Encoded this way:
 	{"type":"changed","timestamp":1358175733785}

Here the type field announces that the target file has changed. The timestamp field contains an integer value representing the number of milliseconds since midnight, January 1, 1970.This happens to be an easy time format to work with in JavaScript.
# Switching to JSON Messages
Now that we’ve defined an improved, computer-accessible protocol, let’s modify the net-watcher service to use it.Then we’ll create client programs that receive and interpret these messages. Open your editor to the net-watcher.js program. Find the following line:

    connection.write(`Now watching " ${filename} " for changes...\n );

And replace it with this:
	
    connection.write(JSON.stringify({type: 'watching', file: filename}) + '\n');

Next, find the call to connection.write inside the watcher:
 	
    const watcher =
 	  fs.watch(filename, () => connection.write(`File changed: ${new Date()}\n`));

And replace it with this:
 	
    const watcher = fs.watch(filename, () => connection.write(
 	    JSON.stringify({type: 'changed', timestamp: Date.now()}) + '\n'));

Save this updated file as net-watcher-json-service.js. Run the new program as always, remembering to specify a target file:
 	
    $ node net-watcher-json-service.js target.txt
	Listening for subscribers...

Then connect using netcat from a second terminal:
 	
    $ nc localhost 60300
 	{"type":"watching","file":"target.txt"}

When you touch the target.txt file, you’ll see output like this from your client:
#captura

Now we’re ready to write a client program that processes these messages.
# Creating Socket Client Connections
In this chapter, we’ve explored the server side of Node.js sockets.Here we’ll write a client program in Node.js to receive JSON messages from our net-watcher-json-service program.We’ll start with a naive implementation, and then improve upon it through the rest of the chapter.Open an editor, insert this and save as net-watcher-json-client.js:
#captura
This short program uses net.connect to create a client connection to localhost port 60300, then waits for data. The client object is a Socket, just like the incoming connection we saw on the server side.

Whenever a data event happens, our callback function takes the incoming buffer object, parses the JSON message, and then logs an appropriate message to the console.

To run the program, first make sure the net-watcher-json-service is running. Then, in another terminal, run the client:

    $ node net-watcher-json-client.js
 	Now watching: target.txt

If you touch the target file, you’ll see output like this:
#captura
This program works, but it’s far from perfect.Consider what happens when the connection ends or if it fails to connect in the first place.This program listens for only data events, not end events or error events.We could listen for these events and take appropriate action when they happen.
# Travis
