attribute vec3 position;
attribute vec2 uv;
uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;
varying vec2 v_uv;

void main() {
	gl_Position = projection * view * model * vec4(position, 1.0);
	v_uv = uv;
}