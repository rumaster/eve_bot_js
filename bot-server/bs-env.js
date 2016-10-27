exports.init=function(bot){

var env={}
bot.env=env;

env.systems=[
  {
    planets:[{
      belts:[{
        asteroids:[{
          location:{x:0,y:0},
          type:'',
          value:2000,
        }]
      }
      ],
    }],
    stations:[{
      
    }
    ],
  }
];

env.points=[];
env.stations=[];

env.ships=[
{
  energy:{value:1000,size:1000,speed:10},
  location:{at:'station',i:1},  //location:{at:'point',i:0}, // space
  cargo:{total:0,size:1000,items:{}},
  targets:[{}],
  miners:[{on:false,target:false,in_time:0},{status:false,target:false,in_time:0}],
  scaner:{on:false,scaned:false,res:[],in_time:0}
},
];

env.bot={
  docked:true,
  docking:false,
  wrapping:false,
}
env.ship=env.ships[0];

env.mouse={x:0,y:0};
env.mouse_moving=false;

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

}
