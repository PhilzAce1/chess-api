const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const socket = require('socket.io');
const mongoose = require('mongoose');
// dbConfig.initializeUsers();

app.use(cors());
app.get('/', (req, res) => {
  res.send('working');
});
const PORT = process.env.PORT || 5000;

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(
  bodyParser.json({
    limit: '50mb',
  })
);

mongoose
  .connect(
  process.env.MongoURI
       ,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    }
  )
  .then(() => console.log('Database connected'))
  .catch(console.error);

app.use('/api/auth', require('./routes/auth'));

const server = app.listen(PORT, () => {
  console.log(`server running on PORT ${PORT}`);
});

const io = socket(server);
io.set('origins', '*:*');
io.on('connection', (socket) => {
  console.log('SOCKET IS CONNECTED');
  // here you can start emitting events to the client
  socket.on('CREATE_GAME', (game) => {
    console.log('GAME RECEIVED', game);
    game.id = Math.floor(Math.random() * 100000000);
    io.emit('RECEIVE_GAME', game);
  });

  socket.on('JOIN_GAME', (game) => {
    // game.id = Math.floor(Math.random() * 100000000);
    io.emit('START_GAME', game);
  });

  socket.on('MOVE_PIECE', (data) => {
    console.log('RECEIVED MOVE', data);
    io.emit('PUSH_MOVE', data);
  });

  socket.on('ROOM', (data) => {
    const { room, userId } = data;
    console.log('INCOMING ROOM', room);
    socket.join(room);
    socket.emit('RECEIVE_ID', userId);
    console.log(`USER ${userId} JOINED ROOM #${room}`);
  });

  socket.on('SELECT_PIECE', (data) => {
    io.emit('PUSH_SELECT_PIECE', data);
  });
  socket.on('SET_IDS', (ids) => {
    io.emit('RECEIVE_IDS', ids);
  });
});

const gameIo = socket(server, { path: '/game/:id' });

gameIo.on('connection', (socket) => {
  console.log('SOCKET IS CONNECTED TO GAME');
});
