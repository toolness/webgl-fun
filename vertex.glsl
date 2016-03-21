// Hi I am a vertex shader.

attribute vec2 a_position;

void main(void) {
  gl_Position = vec4(a_position, 0, 1);
}
