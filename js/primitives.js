var plib = require('./plib')

module.exports = {}


/** Primitives **/
module.exports.Sphere = function(pos, radius, color, phong, reflection){
  this.pos = pos;
  this.radius = radius;
  this.color = function(pt){return color};
  this.phong = phong;
  this.reflection = reflection || 0;

  this.intersects = function(ro, rd){
    var rdn = plib.v3.normalise(rd);
    var dst =plib.v3.sub(ro, this.pos);
    var b = plib.v3.dot(dst, rdn);
    var c = plib.v3.dot(dst, dst)- this.radius*this.radius;
    var d = b*b-c;
    if (d){
      return -b - Math.sqrt(d)}
    return false;
  
  }
  
  this.normal = function(pt){
    return plib.v3.normalise(plib.v3.sub(pt, this.pos));
  }

};

module.exports.CheckerYPlane = function(y, col1, col2){
	this.y = y;
	this.col1 = col1;
	this.col2 = col2;
	this.phong = 0;
	this.reflection = 0.1;
	
	this.intersects = function(ro, rd){
		var rdn = plib.v3.normalise(rd);
		return plib.v3.dot([0,1,0], plib.v3.sub([0,this.y,0], ro))/ plib.v3.dot([0,1,0], rdn);
	}
	this.normal = function(pt){
		return [0,1,0];
	}
	
	this.color = function(pt){
		var zig = pt[0] > 0 ? parseInt(Math.abs(pt[0])/50) % 2 == 0 : parseInt(Math.abs(pt[0])/50) % 2 != 0
		var zag = pt[2] > 0 ? parseInt(Math.abs(pt[2])/50) % 2 == 0 : parseInt(Math.abs(pt[2])/50) % 2 != 0
		
		if(!zig != !zag)// zig XOR zag
			return this.col1;
		return this.col2;	
	
	}
	
}
