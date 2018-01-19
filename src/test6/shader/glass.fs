// precision mediump float;
// uniform samplerCube u_sampler; // 采样器
// uniform vec3 u_eyePosition; // 相机的位置向量
// varying vec3 v_normal;
// varying vec3 v_position;
// void main(){
// 	// 计算视线向量eye
// 	vec3 eye = normalize( u_eyePosition - v_position );
	
// 	// 计算发射向量，即纹理坐标
// 	vec3 texCoord = reflect( -eye, v_normal );
// 	gl_FragColor = textureCube( u_sampler, texCoord );
// }
