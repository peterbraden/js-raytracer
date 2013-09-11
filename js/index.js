var raytracer = require('./raytracer')
  , $ = require('jquery-browserify')

console.log(raytracer)
var rays = raytracer

/** Scene Params **/
rays.eye = [0,0,0];
rays.cam_dist = 200; /* Cam plane is x,y,cam_dist */
rays.ambient = 0.1;
rays.max_depth = 3;
rays.antialias = 4;//Num samples

rays.scene = {}
rays.scene.objects = [
  new rays.CheckerYPlane(0.0, [0x33,0x33,0x33], [0xdd,0xdd,0xdd])
/*
	new rays.Sphere([7, 5, 5], 5.0, [0xff,0,0], 20,  0.2)
,	new rays.Sphere([0,5,12], 5, [0,0,0xff], 20, 0.2)
, new rays.Sphere([-7 , 5, 5], 5.0, [0x00,0xff,0x00], 30, 0.2)
*/


	];

for (var x = -3; x < 3; x++){
  for (var z = 0; z < 4; z++){
    rays.scene.objects.push(
      new rays.Sphere(
        [x * 8 + (x%2), 2 + z*3 + Math.abs(x), z*8], 3, [0xff,0xff,0xff], 10, 0.7))
  }
}

rays.scene.sky = [0xe, 0xe, 0xff]
rays.scene.lights = [
/*	 [[x,y,z], intensity(0-1), color] */
	[[-300,300,0], 0.6, [0xff, 0xff, 0xff]]
]
rays.scene.camera = new rays.Camera([0.0,10.0,-50.0], [0.0,5.0,0.0], Math.PI/4, 5, 4);


/** Onload setup the canvas and do shizzle **/
$(function(){
	var screen = $("#rays")[0];
	var ctx = screen.getContext('2d');

	ctx.fillStyle = "#555";
	ctx.fillRect (0, 0, screen.width, screen.height);

  rays.imdat = ctx.getImageData(0, 0, screen.width, screen.height)
  rays.width = screen.width
  rays.height = screen.height

  rays.renderLine = function(y){
    //ctx.putImageData(rays.imdat, 0, 0, 0, y, rays.width, 1)
    ctx.putImageData(rays.imdat, 0, 0)
  }

	$("#start_raytracer").click(function(){
    rays.start(0, 0, rays.width, rays.height)
	});

});
