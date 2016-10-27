//var cpp=require("cpp");
/*
unload
undock
dock_to_station
go_to_point
mine
mine.scan
mine.select_target
mine.deselect_target
mine.miner_turn_on
mine.miner_turn_off
main.wait

реинвентаризация имущества
получыение списка пилотов на станции, в локали
получение списка товаров и цен
продавать товар
покупать товар
грузить на корабль
устанавливать снаряжение
снимать снаряжение
менять корабль
продливать лицензию
загружать навыки
*/
consts={};

consts.address_menu_wrap_dx=20;
consts.address_menu_wrap_dy=50;


exports.init=function(bot){

  bot.action.add( // Лететь на станцию и причалить к ней
  "dock",
  function(b){
    return !b.ship.docked;
  },
  function(b){
    b.ship.docked=true;
    b.ship.location.at='station';
    b.ship.location.i=b.dock.variation;
  },
  function(b){
    return b.stations;
  }
);

bot.action.add( // Отчалить от станции
  "undock",
  function(b){
    return b.ship.docked;
  },
  function(b){
    b.ship.docked=false;
    b.ship.location.at='space';
  }
);

bot.action.add( // Лететь на точку
  "go_to_point",
  function(b){
    return !b.ship.docked && b.ship.location.at!='station' && !(b.ship.location.at=='point' && b.ship.location.i==b.go_to_point.variation);
  },
  function(b){
    b.ship.location.at='point';
    b.ship.location.i=b.go_to_point.variation;
  },
  function(b){
    return b.points;
  }
);

bot.action.add( // Выгрузить руду на склад
  "unload",
  function(b){
    return b.ship.docked && b.ship.cargo.total>0;
  },
  function(b){
    var s=b.ship.location.i;
    b.stations[s].cargo.total+=b.ship.cargo.total;
    for(var i in b.ship.cargo.items){
      b.stations[s].cargo.items[i].count+=b.ship.cargo.items[i].count;
    }
    b.ship.cargo.total=0;
    b.ship.cargo.items={};
  }
);

bot.action.add(  // Бурить. Супердействие (для планировщика)
  "mine",
  function(b){
    return b.ship.location.at=='point' && b.ship.cargo.total<b.ship.cargo.size*0.7 && b.points[b.ship.location.i].ore.all>b.ship.cargo.size*0.5;
  },
  function(b){
    // проработать лучше. какие виды руды и в каком количестве будут выработаны
    b.ship.cargo.total=b.ship.cargo.size;
    b.points[b.ship.location.i].ore.all-=b.ship.cargo.size;
  }
);

//# субдействия

bot.action.add( // Включить сканер
// действие со слабопредсказуемым результатом
  "mine.scan",
  function(b){
    return !b.data.scaned; // Если сканер не запускался
  },
  function(b){
    b.data.scaned=true; // последние результаты сканиования на точке
  }
);

// Многовариативное ли это действие и что варьировать? Типы руды или номер бурильника?
bot.action.add( // Выбрать астероид в цель
// действие с заранее неизвестной возможностью реализации (пока не придёт время его реализации)
  "mine.select_target", // Выбрать в цель астероид иходя из результатов сканера
  function(b){
    if(!b.data.scaned)return false;// Если выполнялось сканирование или реальная обстановка допускает (есть реальные данные сканера) и есть свободные бурильники 
    for(var i in b.ship.miners){
      if(!b.ship.miners[i].target)return true;
    }
    return false;
  },
  function(b){
    for(var i in b.ship.miners){
      if(!b.ship.miners[i].target){
        b.ship.miners[i].target=true;
        break;
      }
    }
  }
);

bot.action.add( // Убрать выделение с астероида
  "mine.deselect_target",
  function(b){
    if(!b.data.scaned)return false;// Если выполнялось сканирование или реальная обстановка допускает (есть реальные данные сканера) и есть свободные бурильники 
    for(var i in b.ship.miners){
      if(b.ship.miners[i].target)return true;
    }
    return false;
  },
  function(b){
    for(var i in b.ship.miners){
      if(!b.ship.miners[i].target){
        b.ship.miners[i].target=false;
        break;
      }
    }
  }
);

bot.action.add( // Включить бурильник
  "mine.miner_turn_on",
  function(b){
    for(var i in b.ship.miners){
      if(b.ship.miners[i].target && !b.ship.miners[i].on)return true;// Если бурильник не включен и для него выбрана цель
    }
    return false;
  },
  function(b){
    for(var i in b.ship.miners){
      if(b.ship.miners[i].target && !b.ship.miners[i].on){
        b.ship.miners[i].on=true;
        break;
      }
    }
  }
);

// Действие выполнение которого желательно в определённый момент времени
bot.action.add( // Выключить бурильник
  "mine.miner_turn_off",
  function(b){
    for(var i in b.ship.miners){
      if(b.ship.miners[i].on)return true;// Если бурильник не включен и для него выбрана цель
    }
    return false;
  },
  function(b){
    for(var i in b.ship.miners){
      if(b.ship.miners[i].on){
        b.ship.miners[i].on=false;
        break;
      }
    }
  }
);

// бездействовать, проводить время
bot.action.add( // Выключить бурильник
  "mine.wait",
  function(b){
    // в этом действии есть смысл если идёт какое либо из асинхронных протяжённых действий, такие как бурение или сканирование
    if(b.ship.scaner.on)return true;
    for(var i in b.ship.miners)if(b.ship.miners[i].on)return true;
    return false;
  },
  function(b){
    // изменяется время. Но сколько времени надо ждать? Если бурим, то знаем время бурения, если сканируем, знаем время сканирования!
    b.time+=1;
  }
);

//# Определение реализации действий
//# Действие
//# Опредление
//#   start: начало выполнения действия
//#   process: процесс выполнения действия
//#   finish: действие завершилось


bot.action.imp(
  "undock",{
  start: function(variation,callback){
    if(!bot.env.ship.docked)return false;
    bot.actions.undock.data.state=0;
    bot.port.key('U',{act:'undock'});
    var eid=bot.event.on('vision',function(param){
      if(!bot.env.ship.docked){
        bot.env.ship.location.at='space';
        bot.event.off('vision',eid);
        callback();
      }
    });
    return true;
  },
  stop: function(){  // остановка выполнения действия. Если это возможно return true
    return false;
  }
});

bot.action.imp(
  "dock",{
  start: function(variation,callback){
    if(bot.env.ship.docked)return false;
    // тут следует проверить вариант, корректен ли он
    bot.actions.dock.data.state=0;
    bot.port.lclick_to("nav_station",{act:''},function(){ // включить врап к станции
      bot.port.lclick_to("nav_line",{act:''},function(){
        bot.port.key('D',{act:'dock'});
        var eid=bot.event.on('vision',function(param){
          if(bot.env.ship.docked){ // наблюдаем когда врап завершится и корбль войдёт в док
            bot.env.ship.location.at='station';
            bot.env.ship.location.i=variation;
            bot.event.off('vision',eid);
            callback();
          }
        });
      });
    });
    return true;
  },
  stop: function(){
    return false;
  }
});

bot.action.imp( // Лететь на точку
  "go_to_point",{
  start: function(variation,callback){
    bot.actions.go_to_point.data.state=0;
    // тут следует проверить вариант, корректен ли он
    bot.port.key('E',{act:'show_navigate_menu'},function(){
      var p=bot.env.points[variation].pos;
      bot.port.rclick_to(p,{act:'navigate_context_menu'},function(){
        p.x+=consts.address_menu_wrap_dx;
        p.y+=consts.address_menu_wrap_dy;
        bot.port.lclick_to(p,{act:'go_to_point',point:variation},function(){
          bot.port.key('E',{act:'hide_navigate_menu'});
          var eid=bot.event.on('vision',function(param){
            switch(bot.actions.go_to_point.data.state){
            case 0:
              if(bot.env.ship.wrapping){ // наблюдаем когда врап начнётся
                bot.actions.go_to_point.data.state=1;
              }
              break;
            case 1:
              if(!bot.env.ship.wrapping){ // наблюдаем когда врап завершится
                bot.env.ship.location.at='point';
                bot.env.ship.location.i=variation;
                bot.event.off('vision',eid);
                callback();
              }
            }
          });
        });
      });
    });
    return true;
  },
  stop: function(){
    return false;
  }
});

bot.action.imp( // Выгрузить руду на склад станции
  "unload", {
  start: function(variation,callback){
    bot.actions.unload.data.state=0;
    bot.port.key('C',{act:''},function(){
      bot.port.lclick_to(inventory_ore_hold,{act:'show_inventory_ore_hold'},function(){
        setTimeout(400,function(){
          bot.port.drag(inv_pt_1,inv_pt_2,{act:'select_items'},function(){
            setTimeout(400,function(){
              bot.port.drag(inventory_pos_1,inventory_items,{act:'unload'},function(){
                setTimeout(300,function(){
                  bot.port.click('L',{act:''},function(){
                    bot.actions.unload.data.state=1;
                    var eid=bot.event.on('vision',function(param){
                      var s=bot.env.ship.location.i;
                      bot.env.stations[s].cargo.total+=bot.env.ship.cargo.total;
                      for(var i in bot.env.ship.cargo.items){
                        bot.env.stations[s].cargo.items[i].count+=bot.env.ship.cargo.items[i].count;
                      }
                      bot.env.ship.cargo.total=0;
                      bot.env.ship.cargo.items={};
                      bot.event.off('vision',eid);
                      callback();
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
    return true;
  },
  stop: function(){
    return false;
  }
});

bot.action.imp( // Бурить
  "mine", {
  start: function(variation,callback){
    bot.env.ship.scaner.scaned=false;
    bot.env.ship.scaner.res=[];
    if(!(bot.env.ship.location.at=='point' && bot.env.ship.cargo.total<bot.env.ship.cargo.size*0.7 && bot.env.points[bot.env.ship.location.i].ore.all>bot.env.ship.cargo.size*0.5))return false;

    bot.action.start('mine.miner_turn_on',1,function(){
    });

    var eidt=bot.event.on('miner_turn_off',function(param){
      // Время отключать бурильник
      bot.action.start('mine.miner_turn_off',param.i,function(){
        // бурильник выключен
      });
    });
    var eid=bot.event.on('vision',function(param){
      if(bot.env.ship.cargo.total>=bot.env.ship.cargo.size*0.9 || bot.env.points[bot.env.ship.location.i].ore.all<2){
        bot.env.ship.cargo.total=bot.env.ship.cargo.size;
        bot.env.points[bot.env.ship.location.i].ore.all-=bot.env.ship.cargo.size;// проработать лучше. какие виды руды и в каком количестве будут выработаны
        bot.event.off('vision',eid);
        bot.event.off('miner_turn_off',eidt);
        callback();
      }
    });

    return true;
  },
  stop: function(){
    return false;
  }
});

bot.action.imp( // Сканировать
  "mine.scan",{
  start: function(variation,callback){
    bot.actions.mine.data.scan_state=0;
    if(bot.env.ship.scaner.on)return false; // Если сканер запускался
    bot.port.key_down({alt:true},null,function(){ // начать сканирование
      bot.port.key('F1',{act:'start_scan'},function(){
        bot.port.key_up({alt:true},null);
        var eid=bot.event.on('vision',function(param){
          switch(bot.actions.mine.data.scan_state){
          case 0:
            if(bot.env.ship.scaner.on){
              bot.actions.mine.data.scan_state=1;
            }
            break;
          case 1:
            if(!bot.env.ship.scaner.on){
              bot.event.off('vision',eid);
              callback();
            }
          }
        });
      });
    });
    return true;
  },
  stop: function(){
    return false;
  }
});

bot.action.imp( // Бурить
  "mine.select_target",{
  start: function(variation,callback){
    if(!bot.env.ship.scaner.res.length==0)return false;// Если выполнялось сканирование или реальная обстановка допускает (есть реальные данные сканера) и есть свободные бурильники
    var b=false;
    for(var i in bot.env.ship.miners){
      if(!b.ship.miners[i].target)b=true;
    }
    if(!b)return false;
    bot.port.key_down({ctrl:true},null,function(){
      bot.port.key('F1',{act:'select_target',i:0},{},function(){
        bot.port.key_up({ctrl:true},null);
        var eid=bot.event.on('vision',function(param){
          for(var i in bot.env.ship.miners){
            if(!bot.env.ship.miners[i].target){
              bot.env.ship.miners[i].target=true;
              break;
            }
          }
          bot.event.off('vision',eid);
          callback();
        });
      });
    });
    return true;
  },
  finish: function(){
    return false;
  }
});

bot.action.imp( // Бурить
  "mine.deselect_target", {
  start: function(){
    if(!b.data.scaned)return false;// Если выполнялось сканирование или реальная обстановка допускает (есть реальные данные сканера) и есть свободные бурильники 
    for(var i in b.ship.miners){
      if(b.ship.miners[i].target)return true;
    }
    return false;
  },
  process: function(){
    bot.port.key_down({alt:true,key:'F12'},{});
    bot.port.lclick_to('target1',{act:'deselect_target',i:0});
    bot.port.key_up({alt:true,key:'F12'},{});
  },
  finish: function(){
    for(var i in b.ship.miners){
      if(!b.ship.miners[i].target){
        b.ship.miners[i].target=false;
        break;
      }
    }
  }
});

bot.action.imp( // Бурить
  "mine.miner_turn_on",{
  start: function(variation,callback){
    if(/*!bot.env.ship.miners[variation].target ||*/ bot.env.ship.miners[variation].on)return false;// Если бурильник не включен и для него выбрана цель

    bot.port.lclick_to('target1',{act:'select_target',i:0},function(){
      bot.port.key('F1',{act:'miner_turn_on',i:variation});
      var time=3000;
      var eid=bot.event.on('vision',function(param){
        if(bot.env.ship.miners[variation].on){
          var t=setTimeout(function(){
            bot.event.emit('miner_turn_off',{i:variation});
          },time);
          var eidt1,eidt2;
          eidt1=bot.event.on('miner_turn_off',function(param){
            // Самопроизвольная остановка бурильника
            if(param.i==variation){
              bot.event.off('turn_off',eidt1);
              bot.event.off('turn_off',eidt2);
            }
          });
          eidt2=bot.event.on('turn_off',function(param){
            // Самопроизвольная остановка бурильника
            if(param.i==variation){
              clearTimeout(t);
              bot.event.off('turn_off',eidt1);
              bot.event.off('turn_off',eidt2);
            }
          });

          bot.event.off('vision',eid);
          callback();
        }
      });
    });
    return true;
  },
  stop: function(){
    return false;
  }
});

bot.action.imp( // Бурить
  "mine.miner_turn_off", {
  start: function(variation,callback){
    if(!bot.env.ship.miners[variation].on)return false;// Если бурильник не включен и для него выбрана цель
    bot.port.key('F1',{act:'miner_turn_off',i:variation});
    var eid=bot.event.on('vision',function(param){
      if(!bot.env.ship.miners[variation].on){
        bot.event.off('vision',eid);
         callback();
      }
    });
    return true;
  },
  stop: function(){
    return false;
  }
});



}




// исправим недоразумение в порядке аргументов
function setTimeout_(time,callback){setTimeout(callback,time)}

/*
  что бы отрабатывать параллельно действия, вроде сканировать и пока идёт сканирование совершать манёвры или бурить несколькими лазерами,
  надо либо вводить параллельные действия, либо действия бить на начало и конец, т.е. 
  начать бурить лазером номер n, закончить бурить лазером номер n (при наступлении определённого условия - прошесвия времени  ещё включенном буре), 
  начать сканирование, а всё, действие получить результаты сканирования уже не надо, они будут получены автоматически!

*/