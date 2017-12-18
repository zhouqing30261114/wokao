attribute vec3 aPosition;
attribute vec3 aColor;
uniform mat4 pMatrix;
uniform mat4 vMatrix;
uniform mat4 mMatrix;
varying vec3 vColor;

void main() {
	gl_Position = pMatrix * vMatrix * mMatrix * vec4(aPosition, 1.0);
	vColor = aColor;
}