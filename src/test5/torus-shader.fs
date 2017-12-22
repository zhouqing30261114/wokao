precision mediump float;

// #pragma glslify: lambert = require(glsl-diffuse-lambert/index.glsl)
#pragma glslify: phongSpec = require(glsl-specular-phong/index.glsl)

uniform sampler2D texture;
uniform vec3 lightPosition;
uniform vec3 eyePosition;
uniform float shininess;
varying vec3 v_position;
varying vec3 v_normal;
varying vec2 v_uv;

void main() {
	vec3 eyeDirection = normalize(eyePosition - v_position);
	vec3 lightDirection = normalize(lightPosition - v_position);
  float power = phongSpec(lightDirection, eyeDirection, v_normal, shininess);

	vec4 textureColor = texture2D(texture, v_uv);

	vec3 ambientLight = vec3(0.3, 0.3, 0.3); // 来点环境光

	// 这里要特别注意，不要把最后的透明度通道也乘以power，要保持它为1.0
  gl_FragColor = vec4(vec3(textureColor) * (vec3(power, power, power) + ambientLight), 1.0);
	
}