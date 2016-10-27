/*
Фронтенд даёт возможность через апи просматривать текущее состояние бота, а так же управлять им
Апи предоставляет функции для просмотра состояния бота и его управления
бот-сервер открывает постоянное соединение с сишной частью бота отвечающего, за манипуляции и обработку видео
*/
var express = require('express');
var app = express();
var api = require('./api.js');
var port_api = require('./port_api.js');
// comunication

var config = require('../config.js');

// Фронтенд
app.use(express.static(__dirname + '/public'));

// АПИ
app.post('/api', function(req, res){
  var body = '';
  req.on('data', function(chunk){
    body += chunk;
  });

  req.on('end', function(){
    _api(body,res);
  });
});

function _api(post,res){
console.log("<< ",post);
  var r={status:"Ok"};
  try{
    var j=JSON.parse(post);
  }
  catch(ex){
    r.status="Error";
    r.message="Invalid json data";
    res.writeHead(200);
    res.end(JSON.stringify(r));
    return;
  }
  if(typeof api[j.q] === 'function'){
    api[j.q](j,r,function(err,r){
      res.writeHead(200);
      res.end(JSON.stringify(r));
    });
  }else{
    r.status="Error";
    r.message="Unknown q";
    res.writeHead(200);
    res.end(JSON.stringify(r));
  }
}

// Бот-сервер
// перенесён в port_api.js



// Инициализация
exports.init=function(bot,bot_start){
  api.init(bot);

  var f=false;
  app.listen(config.bot_api_port, function () {
    if(f)bot_start();
    else f=true;
    console.log('Bot app listening on port '+config.bot_api_port+'!');
  });
//setTimeout(function(){
  port_api.init(bot,function(){
    if(f)bot_start();
    else f=true;
  });
//},1000);
}
