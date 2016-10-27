var bot={}; // Корневой объект бота

bot.actions={};
bot.action={};
bot.action.imp=function(name, implementation){
  bot.actions[name]={};
  bot.actions[name]['imp']=implementation;
}
bot.action.start=function(name,param,callback){
  if(typeof bot.actions[name] == 'undefined' || typeof bot.actions[name].imp.start != 'function')return;
  return bot.actions[name].imp.start(param,callback);
}


bot.event={ev:{}};
bot.event.emit=function(name,param){
  if(typeof this.ev[name]=='undefined')this.ev[name]={on:[],timer:[]};
  for(var i in this.ev[name].on){
    //if(typeof bot.event[name].on[i] =='function')
    this.ev[name].on[i](param);
  }
}
bot.event.on=function(name,callback){
  if(typeof this.ev[name]=='undefined')this.ev[name]={on:[],timer:[]};
  return this.ev[name].on.push(callback)-1;
}
bot.event.off=function(name,id){
  delete this.ev[name].on[id];
}


exports.bot=function(){return bot;}