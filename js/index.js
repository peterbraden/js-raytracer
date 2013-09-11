var raytracer = require('./raytracer')
  , $ = require('jquery-browserify')
  , primitives = require('./primitives')
  , cam = require('./lights-camera-action')

console.log(raytracer)
var rays = raytracer

/** Scene Params **/
rays.eye = [0,0,0];
rays.cam_dist = 200; /* Cam plane is x,y,cam_dist */
rays.ambient = 0.1;
rays.max_depth = 3;
rays.antialias = 4;//Num samples

rays.scene = {}


rays.scene.objects = [new primitives.CheckerYPlane(0.0, [0x33,0x33,0x33], [0xdd,0xdd,0xdd])];

for (var x = -3; x < 3; x++){
  for (var z = 0; z < 4; z++){
    rays.scene.objects.push(
      new primitives.Sphere(
        [x * 8 + (x%2), 2 + z*3 + Math.abs(x), z*8], 3, [0xff,0xff,0xff], 10, 0.7))
  }
}

rays.scene.sky = [0xe, 0xe, 0xff]
rays.scene.lights = [
/*	 [[x,y,z], intensity(0-1), color] */
	[[-300,300,0], 0.6, [0xff, 0xff, 0xff]]
]
rays.scene.camera = new cam.Camera([0.0,10.0,-50.0], [0.0,5.0,0.0], Math.PI/4, 5, 4);


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
