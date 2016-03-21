// Hi I am a vertex shader.

attribute vec2 a_position;

varying vec4 v_color;

void main(void) {
  gl_Position = vec4(a_position, 0, 1);
  v_color = gl_Position * 0.5 + 0.5;
}
