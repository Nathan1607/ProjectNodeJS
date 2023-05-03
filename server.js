const express = require('express');
const session = require('express-session');
const url = require('url');
const fs = require('fs');
const ejs = require('ejs');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const { error } = require('console');
const io = new Server(server);
const port = 8080


//Routes du site
app.get('/tchat', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/', (req, res) => {
  ejs.renderFile(__dirname + "\\home.ejs", {title: 'home'}, (error, content) => {
    console.log(error);
    res.end(content);
  }) 
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
    res.redirect('/');
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
io.on('connection', (socket) => {
  console.log('user connected');
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});


//Lancement server
server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});