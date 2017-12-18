precision mediump float;
uniform vec4 color;
uniform sampler2D texture;
varying vec2 vPosition;

void main() {
	vec2 texCoord = 1.0 - (vPosition + 1.0) / 2.0; // 计算纹理坐标
	gl_FragColor = texture2D(texture, texCoord) * color;
}