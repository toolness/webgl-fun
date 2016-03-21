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

function getAttribLocation(gl, program, name) {
  var location = gl.getAttribLocation(program, name);

  if (location === -1)
    throw new Error('program attribute not found: ' + name);

  return location;
}

function runShaderProgram(gl, program) {
  var positionLoc = getAttribLocation(gl, program, 'a_position');
  var buffer = gl.createBuffer();
  var vertexSize = 2;
  var floats = new Float32Array([
    -1.0, -1.0,
     1.0, -1.0,
    -1.0,  1.0,
    -1.0,  1.0,
     1.0, -1.0,
     1.0,  1.0
  ]);

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, floats, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionLoc);
  gl.vertexAttribPointer(positionLoc, vertexSize, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLES, 0, floats.length / vertexSize);
}

function main() {
  var canvas = document.getElementById("main");
  var gl = canvas.getContext("webgl");

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

    gl.useProgram(program);
    runShaderProgram(gl, program);
  }).catch(function(reason) {
    console.log("Failed to fetch and compile shaders!", reason);
  });
}

onload = main;
