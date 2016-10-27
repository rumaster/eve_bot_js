var async = require('async');

var bot;

exports.init=function(b){bot=b;}

exports.plan = function(j,r,api_callback){
  async.waterfall([
    function(callback){
      r.current_plan=bot.current_plan;
      r.inx=bot.inx;
      callback();
    },
  ],function(err, results){
      if(err){
        r.status="Error";
        r.message=err;
      }else{
        //r.status
      }
      api_callback(null,r);
  });
}

exports.env = function(j,r,api_callback){
  async.waterfall([
    function(callback){
      r.env=bot.env;
      delete r.env.clone;
      callback();
    },
  ],function(err, results){
      if(err){
        r.status="Error";
        r.message=err;
      }else{
        //r.status
      }
      api_callback(null,r);
  });
}

exports.set_goal = function(j,r,api_callback){
  async.waterfall([
    function(callback){
      r.goal=j.goal;
      callback();
    },
  ],function(err, results){
      if(err){
        r.status="Error";
        r.message=err;
      }else{
        //r.status
      }
      api_callback(null,r);
  });
}


exports.vision = function(j,r,api_callback){
  async.waterfall([
    function(callback){
//      j.scaner;
//      j.radar;
//      j.ship.cargo;
//      j.ship.speed;
//      j.ship.health;
//      j.miners[i].on;
//      j.targets[i];
//      j.dock.cargo;
//      j.docked
//      j.wrapping;
      if(typeof j.docked !='undefined')bot.env.ship.docked=j.docked;
      if(typeof j.wrapping !='undefined')bot.env.ship.wrapping=j.wrapping;
      if(typeof j.ship == 'object'){
        if(typeof j.ship.cargo == 'object'){
          bot.env.ship.cargo.total=j.ship.cargo.total;
          bot.env.ship.cargo.items=j.ship.cargo.items;  // все ли айтемы видны?! перепроверить кол-во?
        }
        if(typeof j.ship.miners == 'object'){
          for(var i in j.ship.miners){
            if(bot.env.ship.miners[i].on && !j.ship.miners[i].on)bot.event.emit('turn_off',{device:'miner',i:i});
            bot.env.ship.miners[i].on=j.ship.miners[i].on;
          }
        }
      }
      if(typeof j.scaner == 'object'){
        bot.env.ship.scaner.on=j.scaner.on;
        bot.env.ship.scaner.res=j.scaner.res; // [{type:name,value:int,dist:int,target,pos:{x,y}}]
      }
      if(typeof j.targets == 'object'){
        for(var i in j.targets){
          // тут может стоит генерировать событие изменения состояния?
          j.targets[i].miner;
        }
      }
      bot.event.emit('vision');
      callback();
    },
  ],function(err, results){
      if(err){
        r.status="Error";
        r.message=err;
      }else{
        //r.status
      }
      api_callback(null,r);
  });
}
