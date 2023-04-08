const express = require('express');
const cors = require('cors');
const createError = require('http-errors');
const morgan = require('morgan');
require('express-async-errors');
require('dotenv').config();

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server)

app.use(cors({
  origin: ['*', 'http://localhost:3000'],
  optionsSuccessStatus: 200,
  credentials: true
}))

// socket.io server-side configuration... (para ni sa pag distribute ug socket.io sa tanang api-routes/controllers)
app.set('socketio_global', io)

io.on('connection', (socket) => {
  // console.log('A user connected', socket.id);

  // sending notification data from client (gikan nis mobile)
  socket.on('send_notification', (data) => {
    console.log('Received new notification:', data);
    // handle the notification here, for example by sending it to other clients (callback para isend balik ang notification sa client)
    socket.broadcast.emit('new_notification', data);
  });

  socket.on('disconnect', () => {
    // console.log('A user disconnected');
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));

app.get('/', async (req, res, next) => {
  res.send({ message: 'Welcome to FarmFriend API' });
});

app.use('/api', require('./routes/api.route'));

app.use((req, res, next) => {
  next(createError.NotFound());
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    status: err.status || 500,
    message: err.message,
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`🚀 Server is running in http://localhost:${PORT}`));