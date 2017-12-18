
precision mediump float;

// 导入lambert材质，注意必须在精度限定语句之后导入
#pragma glslify: lambert = require(glsl-diffuse-lambert/index.glsl)

uniform vec3 color;
uniform vec3 lightPosition;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vec3 lightDirection = normalize(lightPosition - vPosition);
  float power = lambert(lightDirection, vNormal);
  gl_FragColor = vec4(0.2, 0.0, 0.0, 1.0) + vec4(color * power, 1.0);
}