'use strict';
const fs = require('fs');
let socket = [];
const net = require("net");
let user=0;

function broadcast(message,index){
    socket.forEach(function(element){
        if(index != socket.indexOf(element)){
            element.write(`Usuario ${index} > ${message}`);
        }
    })
};

net.createServer(
    connection => {
        socket.push(connection);

        console.log(`Nueva conexion ${user}`);
        connection.write('Has entrado al chat'+'\n');
        broadcast(`usuario ${user} se ha conectado`+'\n',user);

        connection.on("data", (data) => {
            broadcast(data,socket.indexOf(connection));
        });
        connection.on('close',()=>{
            console.log(`Usuario ${socket.indexOf(connection)} desconectado`);  
            broadcast(`Usuario ${socket.indexOf(connection)} desconectado\n`,socket.indexOf(connection));
            socket.splice(socket.indexOf(connection),1);
            socket.forEach(function(element){
                element.write(`Te has convertido en usuario ${socket.indexOf(element)}`+'\n');
            })
        });
        user++;
}).listen(8000, () => console.log('Esperando usuarios...'));