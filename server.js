var http = require('http')
  , fs = require('fs')
  , browserify = require('browserify')


var server = http.createServer(function(req, res){
  if (req.url == '/bundle.js'){
    console.log(">> serving bundle", new Date())
    return browserify(__dirname + '/js')
      .bundle({debug:true})
      .pipe(res)
  }

  res.writeHead(200, {'Content-Type': 'text/html'})
  res.end(fs.readFileSync("./raytracer.html"))

}).listen(8080) 
