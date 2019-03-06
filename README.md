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
a
