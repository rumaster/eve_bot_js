var bot={}; // Корневой объект бота
bot.actions={};
bot.actions_={};
bot.sensor_data={};
bot.sensor_data.time=0;



bot.act_level=0;
bot.plan_inx=[];
bot.acts=[];         // Развёрнутое дерево супердействия
bot.current_plan=[]; // Массив запланированных действий по 
bot.current_action=[]; // Массив текущего действия и субдействий

//bot.current_plan[bot.act_level][bot.plan_inx[bot.act_level]]  < Запланированное действие
//bot.current_action[bot.act_level]              < Текущее действие высшего уровня

/*
bot.actions[action_name]={
  condition:function(bot_state), // проверка возможности действия
  movement:function(bot_state),  // изменяет вариант состояния
  variations:function(bot_state),// многовариантное действие, аргументы вариант
  imp:{
    start:function(),
    process:function(),
    finish:()
  }
}
bot_state - вариант состояния бота и среды
*/


bot.action={};
bot.action.add=function(name, condition, movement, variations){
  var names=name.split('.');
  if(names.length==1){
    bot.actions[names[0]]={'name':name, 'condition':condition, 'movement':movement, 'variations':variations, data:{}};
    bot.actions_[name]=bot.actions[names[0]];
  }else if(names.length>1 && bot.actions[names[0]]){
    if(typeof bot.actions[names[0]].subactions != 'object')bot.actions[names[0]].subactions={};
    bot.actions[names[0]].subactions[names[1]]={'name':name, 'condition':condition, 'movement':movement, 'variations':variations};
    bot.actions_[name]=bot.actions[names[0]].subactions[names[1]];
  }
}
bot.action.imp=function(name, implementation){
  var names=name.split('.');
  if(names.length==1){
    bot.actions[name]['imp']=implementation;
  }else if(names.length>1 && bot.actions[names[0]]){
    bot.actions[names[0]].subactions[names[1]]['imp']=implementation;
  }
}
bot.action.start=function(name,variation,callback){
console.log("start action: "+name);
  var names=name.split('.');
  if(names.length==1){
    return bot.actions[name].imp.start(variation,callback);
  }else if(names.length>1 && bot.actions[names[0]]){
    return bot.actions[names[0]].subactions[names[1]].imp.start(variation,callback);
  }  
}


bot.event={ev:{}};
bot.event.emit=function(name,param){
  if(typeof this.ev[name]=='undefined')this.ev[name]={on:[],timer:[]};
  for(var i in this.ev[name].on){
    //if(typeof bot.event[name].on[i] =='function')
    this.ev[name].on[i](param);
  }
}
bot.event.add=function(name,param,timeout){
  if(typeof this.ev[name]=='undefined')this.ev[name]={on:[],timer:[]};
  this.ev[name].timer.push(setTimeout(timeoutf,timeout));
  function timeoutf(){
    for(var i in bot.event.ev[name].on){
      bot.event.ev[name].on[i](param);
    }
  }
}
bot.event.on=function(name,callback){
  if(typeof this.ev[name]=='undefined')this.ev[name]={on:[],timer:[]};
  return this.ev[name].on.push(callback)-1;
}
bot.event.off=function(name,id){
  delete this.ev[name].on[id];
}




bot.save_env=function(){
  fs.writeFileSync("bot.env.json",JSON.stringify(bot.env));
}

bot.load_env=function(){
  try{
    bot.env=JSON.parse(fs.readFileSync("bot.env.json"));
  }catch(e){}
}

exports.bot=function(){return bot;}