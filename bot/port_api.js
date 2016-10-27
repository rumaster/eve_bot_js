var net = require('net');

var config = require('../config.js');

var connection;
var is_connected=false;

var msg_id=0;     // идентификаторы передаваемых на сервер сообщений. Нужны для асинхронного приёма ответа сервера на сообщения
var callbacks={}; // массив сохранённых колбеков которые следует вызвать при получении ответа на запрос


var send_cmd=function(cmd,act,callback){
  if(!is_connected)return;

  msg_id++;
  callbacks[msg_id]=callback;
  var packet=JSON.stringify({
    msg_id:msg_id,
    cmd:cmd,
    act:act
  });
  console.log('> ',packet);
  connection.write(packet+"\0");
}

var on_recv=function(recv){
  if(typeof callbacks[recv.msg_id] != 'function'){
    return;
  }
  callbacks[recv.msg_id]();
  delete callbacks[recv.msg_id];
}


var port={};
// Набор функций более подходящий для реального применения
// Для моделирования лучше передавать более абстрактные запросы, аналогичные действиям, либо вместе с низкоуровневыми манипуляциями, передавать цель манипуляции - действие

// Ввод текста
port.type=function(text,act,callback){
  send_cmd({action:'type',text:text},act,function(){
    callback();
  });
}

// Опускание клавиши
// key={ctrl:bool,shift:bool,alt:bool,key:string}
port.key_down=function(key,act,callback){
  send_cmd({action:'key',key:key},act,function(){
    callback();
  });
}

// Отпускание клавиши
// key={ctrl:bool,shift:bool,alt:bool,key:string}
port.key_up=function(key,act,callback){
  send_cmd({action:'key',key:key},act,function(){
    callback();
  });
}

// Нажатие клавиши
// key:string
port.key=function(key,act,callback){
  send_cmd({action:'key',key:key},act,function(){
    if(typeof callback == 'function')callback();
  });
}

// Нажатие кнопки мыши. btn = 'L' | 'R' | 'M'
port.click=function(btn,act,callback){
  send_cmd({action:'click',btn:btn},act,function(){
    callback();
  });
}
port.click_to=function(btn,to,act,callback){
  port.move_to(to,null,function(){
    port.click(btn,act,function(){
      callback();
    });
  });
}
port.lclick_to=function(to,act,callback){
  port.click_to('L',to,act,function(){
    callback();
  });
}

port.rclick_to=function(to,act,callback){
  port.click_to('R',to,act,function(){
    callback();
  });
}

// Перемещение указателя мыши на позицию
// to.x, to.y - координаты позиции
// to.t - время за которое требуется переместить указатель, если не заданно, то расчитывается из соображений константной скорости
port.move_to=function(to,act,callback){
  if(typeof to.obj == 'string'){
    if(typeof bot.objects[to.obj]=='object'){
      to.x=bot.objects[to.obj].x;
      to.y=bot.objects[to.obj].y;
    }
    else{
      console.log('ERROR');
      callback();
      return;
    }
  }
  send_cmd({action:'move_to',pos:to},act,function(){
    callback();
  });
}

// Действие перетчгивания (выделения мышкой), когда опускаеся левая кнопка, перемещается мышь и подымается левая кнопка
port.drag_to=function(to,act,callback){
  if(typeof to.obj == 'string'){
    if(typeof bot.objects[to.obj]=='object'){
      to.x=bot.objects[to.obj].x;
      to.y=bot.objects[to.obj].y;
    }
    else{
      console.log('ERROR');
      callback();
      return;
    }
    send_cmd({action:'drag_to',pos:to},act,function(){
      callback();
    });
  }
}

port.drag=function(from,to,act,callback){
  port.move_to(from,null,function(){
    port.drag_to(to,act,function(){
      callback();
    });
  });
}




var try_connect=function(){
  connection.connect();
}

exports.init=function(bot,callback){
  bot.port=port;
  connection = net.createConnection(config.server_port, 'localhost');

  connection.setEncoding('utf8');
  connection.on('connect', function(){
    is_connected=true;
    console.log('Connected to bot-server');
    callback();
  });

  connection.on('error', function(err){
    console.error(err);
//    setTimeout(try_connect,2000);
  });

  var packet_str="";
  connection.on('data', function(d){
    // принимаем пакет целиком, пакет есть json строка, конец пакета \0
    var ds=d.toString();
    console.log('< ' + ds);
    // найти конец пакета
    for(var i in ds){
      if(d[i]=="\0"){
          on_recv(JSON.parse(packet_str));
        try{
        }catch(e){
          console.log("Parse packet error!");
          console.log(packet_str);
          console.log(e);
        }
        packet_str="";
      }else packet_str+=ds[i];
    }
  });

  connection.on('close', function(){
    is_connected=false;
    console.log('Bot server Connection closed');
    setTimeout(try_connect,2000);
  });
}