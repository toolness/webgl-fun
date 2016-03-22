// Hi I am a vertex shader.

attribute vec2 a_position;

varying vec4 v_color;
varying vec2 v_texCoord;

uniform vec4 u_color_offset;

void main(void) {
  gl_Position = vec4(a_position, 0, 1);
  v_texCoord = a_position * mat2(0.5, 0, 0, -0.5) + 0.5;
  v_color = gl_Position * 0.5 + 0.5 + u_color_offset;
}
