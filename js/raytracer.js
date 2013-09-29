var plib = require('./plib.js')

require('setimmediate')

module.exports = rays = {};
rays.intToColor = function(i){
	var c = [i % 256, (i>>8) % 256, (i>>16) % 256]
	return 'rgb(' + parseInt(c[0]) + "," + parseInt(c[1]) + "," + parseInt(c[2]) + ')';
}

rays.pixelToInt = function(c){
	c[0] = Math.max(0, Math.min(c[0], 255));
	c[1] = Math.max(0, Math.min(c[1], 255));
	c[2] = Math.max(0, Math.min(c[2], 255));

	return parseInt(c[0] + (c[1] << 8) + (c[2] << 16));
}

rays.intAsHex = function(i){
	return i.toString(16);
}

rays.intAsChar = function(i){
	return i.toString(36);
}



/**
* Determine whether the ray from ro->rd intersects an object and if so return the nearest distance and object
*/
rays.intersection = function(ro, rd, max, min){
	var min = min || 0.0;
	var nearest = null;
	var nearest_dist = max;
	
	var objs = rays.scene.objects
  for (var i = 0, ii = objs.length; i<ii; i++){
		var d = objs[i].intersects(ro, rd);
		if(d && d < nearest_dist && d > min){
			nearest_dist = d;
			nearest = objs[i];
		}
  }

	return [nearest_dist, nearest];
}


/**
* Trace a ray (ro->rd) through the scene
*/
rays.trace = function(ro, rd, depth){
	var depth = depth || 0
	var i = rays.intersection(ro,rd, 1.0E100000);
	var nearest = i[1];
	var dist = i[0];	

	if (nearest){
		var intersection_point = plib.v3.add(ro, plib.v3.scale(plib.v3.normalise(rd), dist));
		var normal = nearest.normal(intersection_point);
		
		//Ambient
		var col_scale = rays.ambient;
		var specs = [0,0,0];
			
		$.each(rays.scene.lights, function(){
			var lvec = plib.v3.sub(this[0], intersection_point)

			var shadow = rays.intersection(intersection_point, lvec, plib.v3.len(lvec), 0.05);
			if (!shadow[1]) {	
				//Diffuse (Lambertian)
				var diff_scale = plib.v3.dot(plib.v3.normalise(lvec), normal) * this[1]
				if (diff_scale > 0){		
					col_scale += diff_scale;
					}
				
				//Specular
				var i = plib.v3.normalise(lvec);
				var r = plib.v3.sub(i, plib.v3.scale(normal, 2.0*plib.v3.dot(normal, i)));
				var dp = plib.v3.dot(r, plib.v3.normalise(rd))
				if (dp >0){
					var spec_scale = Math.pow(dp, nearest.phong)
					if (spec_scale > 0){		
						specs = plib.v3.add(specs, plib.v3.scale(this[2], spec_scale*this[1]))
					}
				}
			}
		});
		var col = plib.v3.add(plib.v3.scale(nearest.color(intersection_point), col_scale), specs);	
		//Reflection
		if (nearest.reflection && depth<rays.max_depth){
			var r = plib.v3.sub(rd, plib.v3.scale(normal, 2.0*plib.v3.dot(normal, rd)));
			var refl = rays.trace(intersection_point, r ,depth+1)
			col = plib.v3.add(plib.v3.scale(col, 1 - nearest.reflection),
				 plib.v3.scale(refl, nearest.reflection))
		}
		
		return col
	
	
	}
	else{
		/* No intersection, background color */
		return rays.scene.sky || [0,0,0];
	}
}

rays.getRay = function(x,y, width, height){
	return plib.v3.sub([x - width/2, y - height/2, rays.cam_dist], rays.eye);
}


/**
* Map renders a single line of the image
*
* This is probably the right sort of size chunk of computation.
*
* Args is [ymin, ymax, xmin, xmax, screenwidth, screenheight]
*/
rays.map = function(args, callback){

 /* 
	var x = args[2];
	var y = args[0];
	var busy = false;
	var res = [];
	
	var i = 0;
	
	//Because a line may take a while, setInterval to allow other computation
	var kill_iter = false; //Screw Firefox's crappy worker implementation
	
	var iter = setInterval(function(){
		if (!busy && !kill_iter){
			busy = true;
			if (x >= args[3] && y>=args[1]){
				clearInterval(iter);
				callback(args, res);
				busy = false;
				kill_iter = true;
			}

			if (rays.antialias){
				var tot = [0.0,0.0,0.0];
				
				var rot_grid = [[0.2, 0.2], [0.2, 0.8], [0.8, 0.2], [0.8, 0.8]];
				
				for(var s = 0; s < rot_grid.length; s++){
					var ray = rays.scene.camera.getRay((x + rot_grid[s][0])/(0.0 + args[3]),(y + rot_grid[s][1])/(0.0 + args[4])); 
					var col = rays.trace(ray[0], ray[1]);
					tot = plib.v3.add(tot, col);
				}
				
				res[i] = rays.pixelToInt(plib.v3.scale(tot, 1.0/(4.0)));
				//postMessage("DBG: " + ray1 + " | "  + ray2 + " | " + res[i]  + " -> " + x + ", " + y);
			}else{
				var ray = rays.scene.camera.getRay(x/(0.0 + args[3]),y/(0.0 + args[4])); 
				res[i] = rays.pixelToInt(rays.trace(ray[0], ray[1]));
			}	
						
			if (x>=args[3]){
				y++;
				x = args[2];
			}else{
				x ++;
			}
			i ++;	
			busy = false;
		}		
	},0);

  */
}

var traceRay = function(x, y, cb){
	var ray = rays.scene.camera.getRay(x,y)
    , pixel = rays.trace(ray[0], ray[1])
	  , res = rays.pixelToInt(pixel)
  cb(pixel)
}



/**
*	Distribute each pixel
*/
rays.renderImage = function(screen, ctx){
	var x = 0;
	var y = 0;
	var busy = false;
	
	var rint = setInterval(function(){
		if (!busy){
			busy = true;
			
			//Update Stats
			//if(x%100 == 0){
				//$("#rpx").text(x);
				//$("#rpy").text(y);
			//	$("#progress").text(parseInt((x*y)/(screen.width*screen.height)*100));	
			//}
				
			//Trace Ray	
			var ray = plib.v3.sub([x - screen.width/2, y - screen.height/2, rays.cam_dist], rays.eye);
			var col = rays.trace(rays.eye, ray);
			ctx.fillStyle = 'rgb(' + parseInt(col[0]) + "," + parseInt(col[1]) + "," + parseInt(col[2]) + ')';
			ctx.fillRect (x,screen.height-y,1,1);
			
			//Update 'loop'
			if(x<screen.width-1){
				x +=1;
			}else{
				x = 0;
				if (y<screen.height-1){
					y +=1;
				}else{
					clearInterval(rint);
				}
			}
			busy = false;
		}
	},0);
}



rays.antialiasgrid = [[0.2, 0.2], [0.2, 0.8], [0.8, 0.2], [0.8, 0.8]];

rays.start = function(orx, ory, wid, heig){
  for (var y = ory; y < heig; y++){
    console.log("!!", setImmediate)
    setImmediate(function(y){
      if (y%10==0) console.log("Rendering Line", y)
    
      for (var x = orx; x < wid; x++){
        var tot = [0,0,0]
        for (var aa = 0; aa<rays.antialiasgrid.length; aa++){
          traceRay(
              (x + rays.antialiasgrid[aa][0]) / wid
            , (y + rays.antialiasgrid[aa][1]) / heig, 
            function(pix){
              tot = plib.v3.add(tot, pix);
            })  
        }
        var pix = plib.v3.scale(tot, 1/4)
        rays.handlePixel(x, y, pix[0], pix[1], pix[2])
      }
      rays.renderLine(y)
    }, y)
  }
}


rays.handlePixel = function(x, y, r, g, b){
  var pos = ((rays.height - y) * rays.width + x) * 4 
  rays.imdat.data[pos]     = r
  rays.imdat.data[pos + 1] = g
  rays.imdat.data[pos + 2] = b
}








	
