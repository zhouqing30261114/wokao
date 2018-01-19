precision mediump float;
uniform samplerCube texture;
varying vec3 v_position;

void main() {
	gl_FragColor = textureCube(texture, v_position);
}