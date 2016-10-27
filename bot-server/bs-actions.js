exports.init=function(bot){


  setInterval(function(){
    var d,m;
    d=bot.env.ship.energy.size-bot.env.ship.energy.value;
    m=bot.env.ship.energy.speed/2;
    if(d>m)d=m;
    bot.env.ship.energy.value+=d;
  },1000/2);

bot.action.imp( // Бурить
  'undock',{
  start: function(param,callback){
    if(!bot.env.docked || bot.env.docking)return false;
    bot.env.docking=true;
    setTimeout(function(){
      bot.env.docked=false;
      bot.env.docking=false;
    },3000);
    return true;
  },
  finish: function(){
    return false;
  }
});

bot.action.imp( // Бурить
  'dock',{
  start: function(param,callback){
    if(bot.env.wrapping || bot.env.docked || bot.env.docking)return false;
    setTimeout(function(){ // процесс манёвра переориентации корабля
      bot.env.wrapping=true;
      setTimeout(function(){ // процесс врапинга
        bot.env.wrapping=false;
        bot.env.location={at:"space",i:param.i};
        bot.env.docking=true;
        setTimeout(function(){ // процесс докинга
          bot.env.docked=true;
          bot.env.docking=false;
        },3000);
      },3000);
    },4000);
    return true;
  },
  finish: function(){
    return false;
  }
});

bot.action.imp( // Бурить
  'go_to_point',{
  start: function(param,callback){
    if(bot.env.docked || bot.env.wrapping)return false;
    setTimeout(function(){ // процесс манёвра переориентации корабля
      bot.env.wrapping=true;
      setTimeout(function(){ // процесс врапинга
        bot.env.wrapping=false;
        bot.env.location={at:"point",i:param.point};
      },3000);
    },4000);
    return true;
  },
  finish: function(){
    return false;
  }
});

bot.action.imp( // Бурить
  'miner_turn_on',{
  start: function(param,callback){
    var n=param.i;
    if(bot.env.docked || bot.env.docking || bot.env.ship.miners[n].on || bot.ship.energy.value<350)return false;
    bot.env.ship.miners[n].on=true;
    bot.ship.energy.value-=350;
    bot.env.ship.miners[n].in_time=Date.now();
    var time=6000; // вообще-то, остаток руды делить на производительность бурильника, или форс мажор
    var t=setTimeout(function(){
      bot.env.ship.miners[n].on=false;
    },time);
    return true;
  },
  finish: function(){
    return false;
  }
});

bot.action.imp( // Бурить
  'miner_turn_off',{
  start: function(param,callback){
    var n=param.i;
    if(!bot.env.ship.miners[n].on)return false;
    bot.env.ship.miners[n].on=false;
    var t=Date.now()-bot.env.ship.miners[n].in_time;  // Время работы бура. От него зависит объём выработки. Но объём не больше чем есть в камушке.
    var v=t*10;
    var m=bot.env.ship.cargo.size-bot.env.ship.cargo.total;
    if(v>m)v=m;           // объём забираемой выработки не более чем есть место в грузовом отсеке. УЧЕСТЬ ЧТО объём дискретный!
    bot.env.ship.cargo.total+=v;
    return true;
  },
  finish: function(){
    return false;
  }
});


bot.action.imp( // Бурить
  "select_target",{
  start: function(param,callback){
    return true;
  },
  finish: function(){
    return false;
  }
});


}