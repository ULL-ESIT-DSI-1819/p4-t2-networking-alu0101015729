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
# Travis
