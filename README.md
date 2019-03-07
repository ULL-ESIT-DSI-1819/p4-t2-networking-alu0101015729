# p4-t2-networking-alu0101015729
# Binding A Server To A TCP Port 
Las conexiones de socket TCP constan de dos puntos finales. Un punto extremo se enlaza a un puerto numerado, mientras que el otro punto extremo se conecta a un puerto.
En Node.js, las operaciones de enlace y conexión son proporcionadas por el módulo net. El enlace a un puerto TCP para escuchar las conexiones se ve así:
```javascript
    'use strict';
    const net = require('net'),
    server = net.createServer(connection => {
      // Use the connection object for data transfer.
    });
    server.listen(60300);
```
El método net.createServer toma una función de devolución de llamada y devuelve un objeto Server.Node.js que invocará la función de devolución de llamada cuando otro punto extremo se conecte. El parámetro de conexión es un objeto Socket que se puede usar para enviar o recibir datos.
Al llamar a server.listen se une al puerto especificado. En este caso, estamos vinculando el número de puerto TCP 60300. Para tener una idea de la configuración, eche un vistazo a la figura. La figura muestra nuestro único proceso Node.js cuyo servidor vincula un puerto TCP. Cualquier número de clientes, que pueden o no ser procesos de Node.js: pueden conectarse a ese puerto vinculado.
![HTML](capturas/tcp.png) <br>
# Writing Data To A Socket
En la parte superior, introducimos los módulos principales de Node.js(fs y net). El nombre del archivo que se va a ver, si se proporciona, será el tercer argumento en process.argv. Si el usuario no proporcionó un archivo de destino para ver,lanzamos un error personalizado.
Ahora echemos un vistazo dentro de la función de devolución de llamada dada a createServer. Esta función de devolución de llamada hace tres cosas: Informa que la conexión se ha establecido (tanto para el cliente con connection.write como para la consola). Comienza a escuchar los cambios en el archivo de destino, guardando el objeto del observador devuelto. Esta devolución de llamada envía información de cambio al cliente usando connection.write. Escucha el evento de cierre de la conexión para informar que el suscriptor se ha desconectado y deja de ver el archivo, con watcher.close.Finalmente,observe que la devolución de llamada pasada a server.listen,al final, Node.js invoca esta función después de que haya enlazado correctamente el puerto 60300 y esté lista para comenzar a recibir conexiones.

# Connecting to a TCP Socket Server with Netcat
Para ejecutar y probar el programa net-watcher, necesitará tres sesiones de terminal: una para el servicio en sí, una para el cliente y otra para activar los cambios en el archivo visto.
En su primer terminal, use el comando watch para tocar el archivo de destino a intervalos de un segundo:        
```javascript
    $ watch -n 1 touch target.txt
```
Con eso funcionando, en un segundo terminal, ejecute el programa net-watcher:
```javascript
    $ node net-watcher.js target.txt 
```
Este programa crea un servicio de escucha en el puerto TCP 60300. Para conectarse a él, usaremos netcat, un programa de utilidad de socket. Abra un tercer terminal y use el comando nc de esta manera:
```javascript
$ nc localhost 60300
```
El resultado quedara algo como esto:
![HTML](capturas/primero.png) <br>
El proceso de net-watcher une un puerto TCP y observa un archivo; ambos recursos se muestran como óvalos. Los suscriptores múltiples pueden conectarse y recibir actualizaciones simultáneamente. Si abre terminales adicionales y se conecta al puerto 60300 con nc, todos reciba actualizaciones cuando el archivo de destino cambie. Los sockets TCP son útiles para la comunicación entre computadoras conectadas en red. Pero si necesita procesos en la misma computadora para comunicarse, los sockets Unix ofrecen una alternativa más eficiente.
# Listening on Unix Sockets
Para ver cómo el net module usa sockets Unix, modifiquemos el programa net-watcher para usar este tipo de canal de comunicación. Tenga en cuenta que los sockets de Unix solo funcionan en entornos similares a Unix.
![HTML](capturas/segunda.png) <br>
# Implementing a Messaging Protocol
En esta sección diseñaremos e implementaremos un mejor protocolo. Un protocolo es un conjunto de reglas que define cómo se comunican los puntos finales en un sistema. Cada vez que desarrolle una aplicación en red en Node.js, estará trabajando con uno o más protocolos. Aquí crearemos un protocolo basado en pasar mensajes JSON a través de TCP. JSON prevalece increíblemente en Node.js. Lo usaremos ampliamente para la serialización y configuración de datos en todo el libro.
# Serializing Messages with JSON
 Vamos a desarrollar el protocolo de paso de mensajes que utiliza JSON para serializar los mensajes. Cada mensaje es un objeto serializado JSON, que es un hash de pares clave-valor. Aquí hay un ejemplo de objeto JSON con dos pares clave-valor:
 	
    {"key":"value","anotherKey":"anotherValue"}

El net-watcher service que hemos estado desarrollando en este capítulo envía dos tipos de mensajes que necesitamos convertir a JSON.
	Cuando se establece la conexión por primera vez, el cliente recibe la cadena: Now watching target.txt for changes... Codificaremos el primer tipo de mensaje de esta manera:
 	
    {"type":"watching","file":"target.txt"}

El campo de tipo indica que este es un mensaje de observación: el archivo especificado ahora se está viendo.

   Cuando el archivo de destino cambia, el cliente recibe una cadena como esta: File changed: Fri Dec 18 2015 05:44:00 GMT-0500 (EST). Codificado de esta manera:
   
 	{"type":"changed","timestamp":1358175733785}

Aquí el campo de tipo anuncia que el archivo de destino ha cambiado. El campo de marca de tiempo contiene un valor entero que representa el número de milisegundos desde la medianoche del 1 de enero de 1970. Esto resulta ser un formato de tiempo fácil para trabajar en JavaScript.
# Switching to JSON Messages
Ahora que hemos definido un protocolo mejorado y accesible por computadora, modifiquemos el servicio de net-watcher para usarlo. Luego, crearemos programas cliente que recibirán e interpretarán estos mensajes. Abra su editor en el programa net-watcher.js. Encuentra la siguiente línea:
    
    connection.write(`Now watching " ${filename} " for changes...\n );

Y reemplazarlo con esto:
	
    connection.write(JSON.stringify({type: 'watching', file: filename}) + '\n');

A continuación, busque la llamada a connection.write dentro del watcher:
 	
    const watcher =
 	  fs.watch(filename, () => connection.write(`File changed: ${new Date()}\n`));

Y reemplazarlo con esto:
 	
    const watcher = fs.watch(filename, () => connection.write(
 	    JSON.stringify({type: 'changed', timestamp: Date.now()}) + '\n'));

Guarde este archivo actualizado como net-watcher-json-service.js. Ejecute el nuevo programa como siempre, recordando especificar un archivo de destino:
 	
    $ node net-watcher-json-service.js target.txt
	Listening for subscribers...

Luego conecte usando netcat desde un segundo terminal:
 	
    $ nc localhost 60300
 	{"type":"watching","file":"target.txt"}

Cuando creas el archivo target.txt, verás una salida como esta en tu cliente:
![HTML](capturas/tercera.png) <br />

Ahora estamos listos para escribir un programa cliente que procesa estos mensajes.
# Creating Socket Client Connections
En este capítulo, hemos explorado el lado del servidor de los sockets Node.js. Aquí escribiremos un programa cliente en Node.js para recibir mensajes JSON de nuestro programa net-watcher-json-service. Comenzaremos con un implementación ingenua, y luego la mejora a través del resto del capítulo. Abra un editor, inserte esto y guárdelo como net-watcher-json-client.js:
```javascript
'use strict';
const net = require('net');
const client = net.connect({port: 60300}); 
client.on('data', data => {   
    const message = JSON.parse(data);
    if (message.type === 'watching'){     
        console.log(`Now watching: ${message.file}`);   
    } 
    else if (message.type === 'changed') {
        const date = new Date(message.timestamp);
        console.log(`File changed: ${date}`);
    }
    else {     
        console.log(`Unrecognized message type: ${message.type}`);   
    } 
});
```
Este programa corto utiliza net.connect para crear una conexión de cliente al puerto 60300 de localhost, luego espera los datos. El objeto cliente es un Socket, al igual que la conexión entrante que vimos en el lado del servidor.

Cada vez que ocurre un evento de datos, nuestra función de devolución de llamada toma el objeto de búfer entrante, analiza el mensaje JSON y luego registra un mensaje apropiado en la consola.

Para ejecutar el programa, primero asegúrese de que net-watcher-json-service se esté ejecutando. Luego, en otro terminal, ejecute el cliente:

    $ node net-watcher-json-client.js
 	Now watching: target.txt

Si toca el archivo de destino, verá una salida como esta:
#captura
Este programa funciona, pero está lejos de ser perfecto. Considere lo que sucede cuando finaliza la conexión o si no se puede conectar en primer lugar. Este programa solo escucha eventos de datos, no eventos finales o eventos de error. Podríamos escuchar estos eventos y tomar las medidas apropiadas cuando suceden.
# Travis
