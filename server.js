const express = require('express');
const http = require('http');
const url = require('url');
const fs = require('fs');
const ejs = require('ejs');
const app = express();
const server = http.createServer();

const { Server } = require("socket.io");
const io = new Server(server);

server.listen(8080, 'localhost');  
server.on('listening', () => console.log('Serveur démarré !'));     

// Système de gestion url
server.on('request', function(request, response) {
    var page = url.parse(request.url).pathname ;
    response.writeHead(200,{"Content-Type": "text/html; charset=UTF-8"}) ;
    console.log('URL demandée : %s %s', request.method, request.url); 

    switch(page) {
        case '/home':
        case '/' : 
            ejs.renderFile(__dirname + "\\home.ejs", {title: 'home'}, (error, content) => {
              console.log(error);
              response.end(content);
            })
            
            break ;
        case '/about' : 
            ejs.renderFile(__dirname + "\\aboutMe.ejs", {title: 'aboutMe'}, (error, content) => {
              console.log(error);
              response.end(content);
            })
            break ;
        case '/chat' : 
            ejs.renderFile(__dirname + "\\socket.ejs", {title: 'Chat'}, (error, content) => {
              console.log(error);
              response.end(content);
            })
            break ;
        case '/login' : 
            ejs.renderFile(__dirname + "\\login.html", {title: 'Login'}, (error, content) => {
              console.log(error);
              response.end(content);
            })
            break ;
        // case '/chat2' : 
        //     res.renderFile(__dirname + "\\chat.html", {title: 'Chat'}, (error, content) => {
        //       console.log(error);
        //       response.end(content);
        //     })
        //     break ;
        case '/error404' : 
            ejs.renderFile(__dirname + "\\Error404.ejs", {title: 'Error404'}, (error, content) => {
              console.log(error);
              response.end(content);
            })
            
            break ;
        default : {
            response.writeHead(404,{"Content-Type": "text/html; charset=UTF-8"}) ;
            fs.readFile(__dirname + "\\Error404.html", (error, content) => {
                console.log(error);
                response.end(content);
              })
        }
    }
});

// // Système de chat
// io.on('connection', (socket) => {
//   console.log('user connected');
//   socket.on('chat message', (msg) => {
//     io.emit('chat message', msg);
//   });
//   socket.on('disconnect', () => {
//     console.log('user disconnected');
//   });
// });