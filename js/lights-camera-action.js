var plib = require('./plib.js')

module.exports = {}

module.exports.Camera = function(location, lookat, angle, width, height, up){
	this.up = up || [0.0,1.0,0.0];
	this.location = location;
	this.lookat = lookat;
	this.angle = angle;
	
	this.camz = plib.v3.normalise(plib.v3.sub(lookat, location));
	this.camx = plib.v3.normalise(plib.v3.cross(this.up, this.camz));
	this.camy = plib.v3.normalise(plib.v3.cross(this.camx, plib.v3.sub([0,0,0], this.camz)));
	
	
	this.tax = Math.tan(angle);
	this.tay = Math.tan((height/width) * angle)
	
	this.getRay = function(x,y){
		var xdir = plib.v3.scale(this.camx, (x - 0.5) * this.tax);
		var ydir = plib.v3.scale(this.camy, (y - 0.5) * this.tay);
		
		var pt = plib.v3.add(this.camz, plib.v3.add(xdir, ydir));
		
		//postMessage("DBG2 " + this.location + " |  " +pt + " | " + plib.v3.sub(pt, this.location) );
		return [this.location, pt]
	
	}
	
}
