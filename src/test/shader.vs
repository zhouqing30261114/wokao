attribute vec3 position;
uniform mat4 pMatrix;
uniform mat4 vMatrix;
uniform mat4 mMatrix;
varying vec2 vPosition;

void main() {
	gl_Position = pMatrix * vMatrix * mMatrix * vec4(position, 1.0);
	vPosition = vec2(position);
}