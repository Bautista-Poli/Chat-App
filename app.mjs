import express  from "express";
import path from 'path';
import { fileURLToPath } from 'url';

import { Server } from "socket.io";

import { createServer } from "node:http";

import { getUsers, getUserId, getChats ,loadChat } from "./database.mjs";


const port = process.env.port ?? 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

const io = new Server(server, {
  connectionStateRecovery: {}
}) 

//import logger from 'morgan'
//app.use(logger('dev'))




io.on('connection',(socket) => {      //Se conecto un nuevo cliente
  console.log('a user has connected!')

  socket.on('disconnect', () => {
    console.log('an user has disconnected')
  })
  socket.on('chat message', async (user2, msg) => {
    const user = socket.handshake.auth.username ?? 'anonymous' //Se podria hacer una funcion para que esto no se repita dos veces
    const user1ID = await getUserId(user);
    const user2ID = await getUserId(user2);
    loadChat(user1ID,user2ID,msg)
    io.emit('chat message', msg,user);

    /*Si se llega a perder la coneccion mientras se recibe un mensaje */
    // Se tendria que cargar desde loadChat(socket.handshake.auth.serverOffset)
    //con !socket.recovered
    
  })

  socket.on('users', async () => {
    try {
      // Call the getUsers function
      const users = await getUsers();
      // Emit the users to the client
      io.emit('users', users);
    } catch (err) {
      // Handle error
      console.error('Error getting users:', err);
    }
  });


  socket.on('cargar chat', async (user2) => {
    try {
      const user = socket.handshake.auth.username ?? 'anonymous'
      console.log(user)
      const user1ID = await getUserId(user);
      const user2ID = await getUserId(user2);
      const result = await getChats(user1ID,user2ID);
      console.log(result);
      io.emit('cargar chat', result,user1ID);
      //io.emit('users', users);
    } catch (err) {
      // Handle error
      console.error('Error getting users:', err);
    }
  });

  
})


app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/login.html')
})

app.get('/page', (req, res) => {
  res.sendFile(process.cwd() + '/index.html')
})

app.use(express.static(path.join(__dirname)));

server.listen(port, ()=>
  console.log( `Server running on port ${port}`)
)