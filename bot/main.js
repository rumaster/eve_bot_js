// https://eveonline-third-party-documentation.readthedocs.io/en/latest/crest/character/char_location.html

var bot=require("./bot.js").bot();
require("./actions.js").init(bot);
require("./environment.js").init(bot,bot_start);
var plan=require("./planner.js").init(bot);

// перспективный план
bot.perspective_plan=[];

// оперативный план
bot.inx=0;
bot.current_plan=[
  {
    action:'undock',
  },
  {
    action:'go_to_point',
    variation:1
  },
  {
    action:'mine',  // супердействие, кое должно быть так же спланировано
    variation:1,
    inx:0,
    sub_plan:[  // Пример планирования
      {
        action:'scan',
      },
      {
        action:'wait',
      },
      {
        action:'select_target',
      },
    ]
  },
  {
    action:'dock',
    variation:0
  },
  {
    action:'unload',
  },
];

console.log(Date.now());

bot.event.on('engine',engine);

function engine(param){
  if(bot.current_plan.length==0)return;
  if(bot.current_plan.length<bot.inx)plan(0);

  var res;
  var act=bot.current_plan[bot.inx].action;
  var variation=null;
console.log(act);
  if(typeof bot.current_plan[bot.inx].started == 'undefined'){ // проверить флаг стартанувшего процесса, если ещё не стартовал, подготовить к старту и стартануть
    if(typeof bot.current_plan[bot.inx].variation != 'undefined')variation=bot.current_plan[bot.inx].variation;
    function back(){
      if(++bot.inx>=bot.current_plan.length)plan(0);
      bot.event.emit('engine');
    }
    res=bot.action.start(act,variation,back);
    if(!res){ // трындец планировщику. Перепланировать!
      plan(0);
      return;
    }
    bot.current_plan[bot.inx].started=true;  // поставить флаг того что успешно стартанули процесс действия
  }
}

function bot_start(){
  bot.event.emit('engine');
}
