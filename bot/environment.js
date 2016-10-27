// Модель окружающей среды и бота в этой среде, внутреннее состояние бота.
// Состояние модели коректируется из внешней среды (обработка сенсорных данных), а так же в процессе выопления действий.
// Клон среды меняется при планировании действий

var extend = require('util')._extend;
var port=require("./port.js");

exports.init=function(bot,bot_start){

var env={}
bot.env=env;

port.init(bot,bot_start);
env.time=0;

env.points=[];
env.stations=[];

env.items=[
  {}
];

// Клонирование состояния для планировщика действий
env.clone=function(){
  return extend({},this);
}

// Начальная инициализация

env.ship={
  docked:true,
  wrapping:false,
  location:{at:'station',i:1},  //location:{at:'point',i:0}, // space
  cargo:{total:0,size:1000,items:{}},
  targets:[{}],
  miners:[{on:false,target:false,in_time:0},{status:false,target:false,in_time:0}],
  scaner:{on:false,scaned:false,res:[],in_time:0}
};


function add_point(point){
  env.points.push(point);
}

function add_station(station){
  env.stations.push(station);
}

add_point({name:'pnt_1',ore:{'abc':12,'bob':3,'all':1500},pos:{x:0,y:0}});
add_point({name:'pnt_2',ore:{'abc':1,'bob':13,'all':1400},pos:{x:0,y:0}});

add_station({name:'station_1',ships:[],cargo:{total:0,items:{}}});
add_station({name:'station_2',ships:[],cargo:{total:0,items:{}}});

// получение данных из внешней среды (от сенсоров)


}