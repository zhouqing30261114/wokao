#pragma glslify: transpose = require('glsl-transpose')
#pragma glslify: inverse = require('glsl-inverse')

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;
varying vec3 v_position;
varying vec3 v_normal;
varying vec2 v_uv;

void main() {
	gl_Position = projection * view * model * vec4(position, 1.0);
	
	v_position = position;

	mat3 normalMatrix = transpose(inverse(mat3(model)));
	v_normal = normalize(normalMatrix * normal);

	vec2 UV_SCALE = vec2(4.0, 1.0);
	v_uv = uv * UV_SCALE;
}