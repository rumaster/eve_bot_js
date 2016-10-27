exports.init=function(bot){
  var ends;
  return function(l){
    bot.inx=0;
    bot.current_plan=[];
    var env=bot.env.clone();
    env.data={};
    var graf=[];
    var ends=[];
    step(env,graf,0); // Построить граф действий рекурсивно
    estimate(graf); // Выбрать траекторию действий
  }
  function step(env,graf,level){
    if(level==10){
      ends.push(env);
      return;
    }
    // Перечислить все действия, проверить их доступность и опробировать
    for(var action in actions){
      if(bot.actions[action].condition(env)){
        var p={};
        g.action=action;
        g.env=env.clone();
        bot.actions[action].movement(g.env);
        g.graf=[];
        graf.push(g);
      }
      for(var i in graf){
        step(graf[i].env,graf[i].graf,level+1);
      }
    }
  }
  function estimate(graf){
    for(var i in ends){
      ends[i].power;
    }
  }

}