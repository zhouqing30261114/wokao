#pragma glslify: transpose = require('glsl-transpose')
#pragma glslify: inverse = require('glsl-inverse')

attribute vec4 position;
attribute vec3 normal;
uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
	vec4 modelPosition = model * position;
	vPosition = modelPosition.xyz;
  gl_Position = projection * view * modelPosition;

	mat3 normalMatrix = transpose(inverse(mat3(model)));
	vNormal = normalize(normalMatrix * normal);
}