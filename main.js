var canvas = document.getElementById("main");
var gl = canvas.getContext("webgl");

function readFile(filename) {
  var req = new XMLHttpRequest();

  return new Promise(function(resolve, reject) {
    req.open('GET', filename);
    req.onload = function() {
      if (req.status === 200)
        return resolve(req.responseText);
      reject(new Error("HTTP " + req.status));
    };
    req.onerror = function() {
      reject(new Error("XMLHttpRequest error"));
    };
    req.send(null);
  });
}

Promise.all([
  readFile('vertex.glsl'),
  readFile('fragment.glsl')
]).then(function(values) {
  var vertexProgram = values[0];
  var fragmentProgram = values[1];

  console.log(vertexProgram);
  console.log(fragmentProgram);
}).catch(function(reason) {
  console.log("Failed to fetch shaders!", reason);
});
