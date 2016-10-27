var uuid=require('uuid');

function _init(th,o,a){
  for(var i in a)if(typeof o[a[i]] != 'undefined')th[a[i]]=o[a[i]];else th[a[i]]=null;
}

function EBot(){
  this.mouse={x:0,y:0};
  this.wrapping=false;
  this.docking=false;
  this.ship=null;
  this.location={at:null,q:[0,0,0],o:[0,0,0]};
  this.speed=0;
}


function Environment(){
  this.objects={};
  this.systems=[];
  this.points=[];
  this.ships=[];
  this.pilots=[];
  this.bot=new EBot();    // current pilot
}
Environment.prototype.register=function(o){
  o.id=uuid.v4();
  this.objects[o.id]=o;
  return o;
}
Environment.prototype.addSolarSystem=function(o){
  var n=this.systems.push(this.register(new SolarSystem(o)));
  return this.systems[n-1];
}
Environment.prototype.addPilot=function(o){
  var n=this.pilots.push(this.register(new Pilot(o)));
  return this.pilots[n-1];
}
Environment.prototype.addShip=function(o){
  var n=this.ships.push(this.register(new Ship(o)));
  var ship=this.ships[n-1];
  if(ship.location.at instanceof Station && ship.location.q[0]==0){
    ship.location.at.ships.push(ship);
  }
  return ship;
}
Environment.prototype.addPoint=function(o){
  var n=this.points.push(this.register(new Point(o)));
  var point=this.points[n-1];
  point.location.at.sys.points.push(point);
  return point;
}
Environment.prototype.addPlanet=function(o){     // SolarSystem.
  var n=o.location.at.planets.push(this.register(new Planet(o)));
  return location.at.planets[n-1];
}
Environment.prototype.addStation=function(o){    // SolarSystem.
  var n=location.at.stations.push(this.register(new Station(o)));
  return location.at.stations[n-1];
}
Environment.prototype.addBelt=function(o){        // Planet.
  var n=location.at.belts.push(this.register(new Belt(o)));
  return location.at.belts[n-1];
}
Environment.prototype.addAsteroid=function(o){    // Belt.
  var n=location.at.asteroids.push(this.register(new Asteroid(o)));
  return location.at.asteroids[n-1];
}



function SolarSystem(o){
  _init(this,o,['name','location']); // o.location Условное положение в рамках карты вселенной
  this.planets=[];
  this.stations=[];
  this.points=[];
  this.gates=[];
}



function Station(o){
  _init(this,o,['name','location']); // o.location Положение относительно звезды
  this.sys=this.location.at;
  this.ships=[];
  this.storage=[];
}



function Planet(o){
  _init(this,o,['name','location']); // o.location Положение относительно звезды
  this.sys=this.location.at;
  this.belts=[];
}



function Belt(o){
  _init(this,o,['name','location']); // o.location Положение относительно планеты
  this.sys=this.location.at.sys;
  this.asteroids=[];
}



function Asteroid(o){
  this.location=o.location; // Положение относительно (центра) пояса
  this.ore=o.ore;
  this.value=o.value;
}
//Asteroid.prototype.



function Ship(o,env){
  this.env=env;
  this.cargo=[];
  this.location=o.location; // .at у какого объекта он находится, .q[x,y,z]
}



function Pilot(o,env){
  this.env=env;
  _init(this,o,['name','location']);
}

function Point(o){
  this.location=o.location;
}


var env=new Environment();
var sys=env.addSolarSystem({name:'sys_1',location:{at:sys,q:[0,0,0]}});
var pln=env.addPlanet({name:'planet_1',location:{at:sys,q:[0,0,0]}});
var blt=env.addBelt({name:'belt_1',location:{at:pln,q:[0,0,0]}});
var ast=env.addAsteroid({ore:'Gold',value:2000,location:{at:blt,q:[0,0,0]}});

var station=env.addStation({name:"station_1",location:{at:sys,q:[0,0,0]}});
env.addShip({location:{at:station,q:[0,0,0]}});
env.addPoint({location:{at:blt,q:[1,-3,0]}});

//console.log(env);

//console.log(JSON.stringify(env,null,1));