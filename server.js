const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const ejs = require('ejs');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const { error, time } = require('console');
const io = new Server(server);
const port = 8080

app.use(cookieParser('cookie-user'));
app.use(express.static('public'));

//Routes du site
app.get('/', (req, res) => {
  ejs.renderFile(__dirname + "\\home.ejs", {title: 'home'}, (error, content) => {
  console.log(error);
  res.end(content);
})
});

app.get('/tchat', (req, res) => {
  ejs.renderFile(__dirname + '\\tchat.ejs', {title: 'Tchat', chatHistory: chatHistory}, (error, content) => {
    console.log(error);
    res.end(content);
  });
});

app.get('/error404', (req, res) => {
  ejs.renderFile(__dirname + "\\error.ejs", {title: 'Erreur'}, (error, content) => {
    console.log(error);
    res.end(content);
  }) 
});

// Route for Download a file
app.get('/download', (req, res) => {
  const file = `${__dirname}/pdf/CV-Nathan_Gaulard.pdf`;
  res.download(file);
}); 


// Gestion de session
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'my-secret-key',
  resave: false,
  saveUninitialized: true
}));

// Gestion du login + admin + route
app.get('/login', (req, res) => {
  ejs.renderFile(__dirname + "\\login.ejs", {title: 'login'}, (error, content) => {
    console.log(error);
    res.end(content);
  })
});

app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (username === 'admin' && password === 'admin') {
    req.session.isLoggedIn = true;
    req.session.username = username;
    res.redirect('/admin');
  } else {
    res.send('Nom d\'utilisateur ou mot de passe incorrect');
  }
});

app.get('/admin', (req, res) => {
  const isLoggedIn = req.session.isLoggedIn;
  const username = req.session.username;
  if (isLoggedIn && username) {
    const message = `Bienvenue ${username}`;
    ejs.renderFile(__dirname + '\\admin.ejs', { message }, (error, content) => {
      console.log(error);
      res.end(content);
    });
  } else {
    res.redirect('/error404');
  }
});

//Deconnexion
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect('/');
    }
  });
});
//Fin de gestion de projet

// Utilisation du Tchat
let chatHistory = [];

io.on('connection', (socket) => {
  
  const date2 = new Date();
  const connectionTime = date2.toLocaleTimeString();

  console.log('user connected');
  io.emit('chat message', 'Un utilisateur s\'est connecté à ', connectionTime);

  socket.emit('chat history', chatHistory);

  socket.on('chat message', (msg) => {
    const date = new Date();
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    const seconde = date.getSeconds().toString().padStart(2, '0');
    const time = `${hour}:${minute}:${seconde}`;
    const message = {
      pseudo: socket.pseudo,
      content: msg,
      time: time
    };
    chatHistory.push(message);
    io.emit('chat message', msg, time);
  });
 
  socket.on('disconnect', () => {
    console.log('user disconnected');
    io.emit('chat message', 'Un utilisateur s\'est déconnecté');

  });
});

// Route défault
app.use((req, res) => {
  res.redirect('/error404');
});

//Lancement server
server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});

