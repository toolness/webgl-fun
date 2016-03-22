// I am a fragment shader.

precision mediump float;

uniform sampler2D u_image;

varying vec4 v_color;
varying vec2 v_texCoord;

void main(void) {
  vec4 texColor = texture2D(u_image, v_texCoord);

  if (texColor[0] == 1.0) {
    gl_FragColor = vec4(0, 0, 0, 0);
  } else {
    gl_FragColor = v_color;
  }
}
