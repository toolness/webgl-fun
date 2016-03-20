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

function buildShader(gl, shaderType, source) {
  var shader = gl.createShader(gl[shaderType]);

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(shaderType + " failed to compile: " +
                    gl.getShaderInfoLog(shader));
  }

  return shader;
}

Promise.all([
  readFile('vertex.glsl'),
  readFile('fragment.glsl')
]).then(function(values) {
  var program = gl.createProgram();
  var vertexShader = buildShader(gl, 'VERTEX_SHADER', values[0]);
  var fragmentShader = buildShader(gl, 'FRAGMENT_SHADER', values[1]);

  console.log("Compiled shaders.");

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error("Failed to link shader program: " +
                    gl.getProgramInfoLog(program));
  }

  console.log("Linked shader program.");
}).catch(function(reason) {
  console.log("Failed to fetch and compile shaders!", reason);
});
