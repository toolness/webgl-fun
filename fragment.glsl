// I am a fragment shader.

precision mediump float;

varying vec4 v_color;

void main(void) {
  gl_FragColor = v_color;
}
