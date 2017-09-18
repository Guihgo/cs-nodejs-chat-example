/*
 * Autor: Guihgo
 * Apoio: CookingScript
 * Data: 17/09/2017
*/

var io = require('socket.io');
var express = require('express');
var path = require('path');
var app = express();
var server = require('http').createServer(app); //cria servidor http utilizando express como intermediador

server.listen(80); //inicia servidor http na porta 80
var socketIo = io.listen(server); //inicia servidor socket utilizando o servidor http criado
console.log('Server http e socket rodando...');

connections = []; //array que guardar as conexões
var msgs = []; //array que guarda as mensagens

app.use(express.static(path.join(__dirname, 'public'))); //deixa public a pasta public - isso é para que o user possa acessar os arquivos estáticos
//Rota para o caminho : 127.0.0.1:80/
app.get('/', function(req, res) { //quando houver requisição nesse caminho
	res.sendFile(path.join(__dirname, 'index.html')); //envia essa página como resposta
});

//Gerenciamento o socket
socketIo.sockets.on('connection', function(socket){ //quando houver uma nova conexão
	connections.push(socket); //coloca no vetor de conexoes
	console.log('Há %s sockets conectado(s)', connections.length);

	//envia quantos users estao online para todos sockets conectados
	socketIo.sockets.emit('nUsersOnline', {nUsersOnline: connections.length});

	//envia todas msgs já escritas para o socket que acabou de conectar
	msgs.forEach(function(theMsg){ //para cada msg contida no em msgs
		socket.emit('postMsg', {msg: theMsg}); //envia a msg para o socket que acabou de conectar
	});

	//OnDisconect - quando um socket desconectar
	socket.on('disconnect', function(data) { //quando desconectar
		connections.splice(connections.indexOf(socket), 1); //retira esse socket das conexões
		console.log('Um client desconectou: '+data);
		console.log('Agora há %s sockets conectado(s)', connections.length);
		//envia quantos users estao online para todos sockets ainda conectados
		socketIo.sockets.emit('nUsersOnline', {nUsersOnline: connections.length});
	});

	//Quando receber uma mensagem
	socket.on('msgEnviada', function(data) { //quando receber uma mensagem
		console.log(data);
		msgs.push(data); //guarda msg no array
		socketIo.sockets.emit('postMsg', {msg: data}); //envia para todos sockets abertos a mensagem que acabou de ser recebida
	});

});
