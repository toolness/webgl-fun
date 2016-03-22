function loadImage(filename) {
  return new Promise(function(resolve, reject) {
    var img = document.createElement('img');

    img.onload = function() {
      resolve(img);
    };
    img.onerror = function() {
      reject(new Error("image " + filename + " failed to load"));
    };

    img.setAttribute('src', filename);
  });
}

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

function getUniformLocation(gl, program, name) {
  var location = gl.getUniformLocation(program, name);

  if (location === null)
    throw new Error('program uniform variable not found: ' + name);

  return location;
}

function getAttribLocation(gl, program, name) {
  var location = gl.getAttribLocation(program, name);

  if (location === -1)
    throw new Error('program attribute not found: ' + name);

  return location;
}

function loadTexture(gl, program, image) {
  var texture = gl.createTexture();
  var textureUnitIndex = 0;

  gl.activeTexture(gl.TEXTURE0 + textureUnitIndex);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(getUniformLocation(gl, program, 'u_image'), textureUnitIndex);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
}

function runShaderProgram(gl, program, options) {
  options = options || {};

  var positionLoc = getAttribLocation(gl, program, 'a_position');
  var colorOffsetLoc = getUniformLocation(gl, program, 'u_color_offset');
  var colorOffset = new Float32Array(options.colorOffset || [0, 0, 0, 0]);
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

  gl.uniform4fv(colorOffsetLoc, colorOffset);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, floats, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionLoc);
  gl.vertexAttribPointer(positionLoc, vertexSize, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLES, 0, floats.length / vertexSize);
}

function startAnimation(gl, program, fpsEl) {
  var minOffset = -0.75;
  var maxOffset = 1.0;
  var colorOffset = 0;
  var offsetDelta = 0.005;
  var lastFpsCheckpoint = Date.now();
  var framesThisSecond = 0;

  function animate() {
    framesThisSecond++;
    if (Date.now() - lastFpsCheckpoint >= 1000) {
      fps.textContent = framesThisSecond;
      lastFpsCheckpoint = Date.now();
      framesThisSecond = 0;
    }

    colorOffset += offsetDelta;
    if (colorOffset > maxOffset) {
      offsetDelta *= -1;
      colorOffset = maxOffset;
    } else if (colorOffset < minOffset) {
      offsetDelta *= -1;
      colorOffset = minOffset;
    }

    runShaderProgram(gl, program, {
      colorOffset: [colorOffset, 0, 0, 0]
    });
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

function main() {
  var fpsEl = document.getElementById('fps');
  var canvas = document.getElementById("main");
  var gl = canvas.getContext("webgl") ||
           canvas.getContext('experimental-webgl');

  Promise.all([
    readFile('vertex.glsl'),
    readFile('fragment.glsl'),
    loadImage('cc.large.png')
  ]).then(function(values) {
    var program = gl.createProgram();
    var vertexShader = buildShader(gl, 'VERTEX_SHADER', values[0]);
    var fragmentShader = buildShader(gl, 'FRAGMENT_SHADER', values[1]);
    var image = values[2];

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
    loadTexture(gl, program, image);
    startAnimation(gl, program, fpsEl);
  }).catch(function(reason) {
    console.log("Failed to fetch and compile resources!", reason);
  });
}

onload = main;
