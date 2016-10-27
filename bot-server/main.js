// Эмитатор серверной части

var http = require('http');
const net = require('net');

var config = require('../config.js');


var bot=require("./bs-bot.js").bot();
require("./bs-actions.js").init(bot);
require("./bs-env.js").init(bot);

console.log(config);
var connected=false;

const server = net.createServer(function(s){
  connected=true;
  // 'connection' listener
  console.log('client connected');
  var packet_str="";
  s.on('data', function(d){
    var ds=d.toString();
    console.log("dats:",ds);
    for(var i in ds){
      if(d[i]==0){
          on_recv(s,JSON.parse(packet_str));
        try{
        }catch(e){
          console.log("Parse packet error!");
          console.log(packet_str);
          console.log(e);
        }
        packet_str="";
      }
      else packet_str+=ds[i];
    }
  });
  s.on('end', function(){
    connected=false;
    console.log('client disconnected');
  });
//  s.pipe(s);
});
server.on('error', function(err){
  //throw err;
  console.log(err);
});
server.listen(config.server_port, function(){
  console.log('server bound');
});

/*
85.195.95.235
33322 22
80 8080
*/

setInterval(vision,1000);

function vision(){
  if(!connected)return;
  var o={q:'vision'};
  o.docked=bot.env.docked;
  o.wrapping=bot.env.wrapping;
  o.ship=bot.env.ship;

  var options={
    host: config.bot_api_host,
    path: '/api',
    port: config.bot_api_port,
    method: 'POST'
  };
//console.log(o);
  var req = http.request(options,function(res){
    var body = '';
    res.on('data', function(chunk){
      body += chunk;
    });
    res.on('end', function(){
//      console.log(body);
    });
  });
  req.on('error',function(err){
    console.log(err);
  });
  req.end(JSON.stringify(o));
}

function response(s,msg_id){
  var p={msg_id:msg_id};
  s.write(JSON.stringify(p)+"\0");
}


function on_recv(s,packet){
  console.log("packet:",packet);
  // определить действие, время исполнения и время ответа на апи
  switch(packet.cmd.action){
  case 'key':
    //setTimeout(,100);
    response(s,packet.msg_id);
    action(packet);
    break;
  case 'click':
    if(bot.env.mouse_moving){
      console.log("ERR mouse_moving & click!!!");
      return;
    }
    response(s,packet.msg_id);
    action(packet);
//    var obj=getObj(env.mouse);
//    if(obj===false){
//      console.log("ERR click & !obj!!!");
//    }
//    switch(obj.name){
//    }
    break;
  case 'move_to':
    if(bot.env.mouse_moving){
      console.log("ERR mouse_moving!!!");
      return;
    }
    bot.env.mouse_moving=true;
    setTimeout(function(){
      bot.env.mouse.x=packet.cmd.pos.x;
      bot.env.mouse.y=packet.cmd.pos.y;
      bot.env.mouse_moving=false;
      response(s,packet.msg_id);
      action(packet);
    },packet.cmd.pos.t);
    break;
  case 'drag_to':
    response(s,packet.msg_id);
    action(packet);
    break;
  default:
    response(s,packet.msg_id);
    action(packet);
  }
}

// Упрощённая реализация действий, позже надо будет сделать похоже как у бота множество объектов действий с методами start
// с той разницей, что у сервера будут явно параллельно выполняться несколько действий

function action(packet){
  if(!packet.act)return;
  if(!bot.action.start(packet.act.act,packet.act)){
    console.log("--WRN!!! "+packet.act.act);
  }
}
