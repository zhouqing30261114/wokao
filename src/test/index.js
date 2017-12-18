import gl2Now from 'gl2-now';
import createShader from 'gl-shader';
import createBuffer from 'gl-buffer';
import glslify from 'glslify';
import { mat4 } from 'gl-matrix';
import createTexture2d from 'gl-texture2d';

import vShaderSource from './shader.vs';
import fShaderSource from './shader.fs';
import baboonImgUrl from './baboon.png';

export default () => {

	const shell = gl2Now();
	const startTime = new Date();
	let shader, triangleBuffer, squareBuffer, texture,
	pMatrix = mat4.create(),
	vMatrix = mat4.create(),
	mMatrix = mat4.create();
	
	shell.on('gl-init', () => {
		const gl = shell.gl;
	
		const image = new Image();
		image.src = baboonImgUrl;
		image.onload = () => {
			texture = createTexture2d(gl, image);
		};
	
		shader = createShader(
			gl,
			glslify(vShaderSource),
			glslify(fShaderSource)
		);
		triangleBuffer = createBuffer(gl, new Float32Array([
			+0.0, +1.0, +0.0,
			-1.0, -1.0, +0.0,
			+1.0, -1.0, +0.0
		]));
		squareBuffer = createBuffer(gl, new Float32Array([
			+1.0, +1.0, +0.0,
			-1.0, +1.0, +0.0,
			+1.0, -1.0, +0.0,
			-1.0, -1.0, +0.0
		]));
		mat4.perspective(
			pMatrix,
			Math.PI / 4,
			gl.drawingBufferWidth / gl.drawingBufferHeight,
			0.1,
			100.0
		);
		mat4.lookAt(
			vMatrix,
			new Float32Array([0.0, 0.0, 20.0]), // eye
			new Float32Array([0.0, 0.0, 0.0]), // target
			new Float32Array([0.0, 1.0, 0.0]), // up
		);
	});
	
	shell.on('gl-render', (t) => {
	
		const gl = shell.gl;
		
		const time = (new Date() - startTime).valueOf();
		const rotateDeg = Math.sin(time * 0.001) * Math.PI * 2;
	
		shader.bind();
		shader.uniforms.pMatrix = pMatrix;
		shader.uniforms.vMatrix = vMatrix;
		if (texture) {
			shader.uniforms.texture = texture.bind();
		}
	
		triangleBuffer.bind();
		shader.attributes.position.pointer(gl.FLOAT, false, 0, 0);
		shader.uniforms.color = new Float32Array([1.0, 0.0, 0.0, 1.0]);
		mat4.identity(mMatrix);
		mat4.translate(mMatrix, mMatrix, new Float32Array([-6.0, 0.0, 0.0]));
		mat4.scale(mMatrix, mMatrix, new Float32Array([4.0, 4.0, 1.0]));
		mat4.rotate(mMatrix, mMatrix, rotateDeg, new Float32Array([0.0, 1.0, 0.0]));
		shader.uniforms.mMatrix = mMatrix;
		gl.drawArrays(gl.TRIANGLES, 0, 3);
	
		squareBuffer.bind();
		shader.attributes.position.pointer(gl.FLOAT, false, 0, 0);
		shader.uniforms.color = new Float32Array([0.0, 1.0, 0.0, 1.0]);
		mat4.identity(mMatrix);
		mat4.translate(mMatrix, mMatrix, new Float32Array([6.0, 0.0, 0.0]));
		mat4.scale(mMatrix, mMatrix, new Float32Array([4.0, 4.0, 1.0]));
		mat4.rotate(mMatrix, mMatrix, rotateDeg, new Float32Array([1.0, 0.0, 0.0]));
		shader.uniforms.mMatrix = mMatrix;
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	});
	
	shell.on('gl-error', () => {
		throw new Error('我艹，侬浏览器不支持webGL');
	});

}
