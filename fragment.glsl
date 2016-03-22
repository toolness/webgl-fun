// I am a fragment shader.

precision mediump float;

uniform sampler2D u_image;

varying vec4 v_color;
varying vec2 v_texCoord;

void main(void) {
  vec4 texColor = texture2D(u_image, v_texCoord);

  gl_FragColor = v_color * 0.8 + texColor * 0.2;
}
