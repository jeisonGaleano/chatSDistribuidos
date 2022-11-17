const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server,{
  cors: {
    origin: "*",
    methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH'],
    allowedHeaders:'*'
  }
});
const cors = require('cors')

const corsConfig = {
  origin:  ['http://localhost:4200'],
  methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH'],
  allowedHeaders:'*'
}

app.use(cors(corsConfig));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

usersConnected = {}

io.on('connection', (socket) => {
  socket.on('disconnect', (data) => {
    delete usersConnected[socket.id]
    io.emit("usersConnected", usersConnected, socket.id)
  })

  socket.on('login', (data) => {
    let user = {...data}
    usersConnected[socket.id] = user 
    io.emit("usersConnected", usersConnected)
  });

  socket.on('closeSession', (idSocket) => {
    delete usersConnected[idSocket]
    io.emit("usersConnected", usersConnected, idSocket)
  });

  socket.on('privateMessage', ( data ) => {
    const userFrom = usersConnected[data.from];
    const userTo = usersConnected[data.to];
    const dataMsg = { 
			date: data.date,
			from: {...userFrom, idSocket:data.from},
			to: {...userTo, idSocket:data.to},
			msg: data.msg,
      isEmitter: data.isEmitter
		}
		socket.broadcast.to(data.to).emit('privateMessage', dataMsg);
	});

  socket.on('groupChat', (data) => {
    io.emit('groupChat', data);
  });

  socket.on('updateUsersConnected', (data) => {
    io.emit("usersConnected", usersConnected)
  });

});


const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Servidor funcionando en el puerto ${PORT}`);
});
