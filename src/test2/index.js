import gl2Now from 'gl2-now';
import createShader from 'gl-shader';
import createBuffer from 'gl-buffer';
import glslify from 'glslify';
import { mat4 } from 'gl-matrix';
import icosphere from 'icosphere';
import vShaderSource from './shader.vs';
import fShaderSource from './shader.fs';

export default () => {	
	const shell = gl2Now();
	const sphereMesh = icosphere();
	const startTime = new Date();

	// 计算顶点坐标
	const sphereVertices = sphereMesh.cells
		.reduce((curr, next) => curr.concat(next))
		.map(item => sphereMesh.positions[item])
		.reduce((curr, next) => curr.concat(next));

	// 计算每个顶点的颜色，每个面的颜色保持一致
	const sphereColors = sphereMesh.cells
		.map(faceItem => {
			const colorArr = [Math.random(), Math.random(), Math.random()];
			return faceItem
				.map(item => colorArr)
				.reduce((curr, next) => curr.concat(next));
		})
		.reduce((curr, next) => curr.concat(next));

	let shader, sphereBuffer, sphereColorBuffer,
	pMatrix = mat4.create(),
	vMatrix = mat4.create(),
	mMatrix = mat4.create();

	shell.on('gl-init', () => {
		const gl = shell.gl;
		gl.enable(gl.DEPTH_TEST);
		shader = createShader(
			gl,
			glslify(vShaderSource),
			glslify(fShaderSource)
		);
		sphereBuffer = createBuffer(gl, new Float32Array(sphereVertices));
		sphereColorBuffer = createBuffer(gl, new Float32Array(sphereColors));
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

	shell.on('gl-render', () => {
		const gl = shell.gl;

		const time = (new Date() - startTime).valueOf();
		const rotateDeg = Math.sin(time * 0.001) * Math.PI * 2;

		shader.bind();
		shader.uniforms.pMatrix = pMatrix;
		shader.uniforms.vMatrix = vMatrix;

		sphereBuffer.bind();
		shader.attributes.aPosition.pointer(gl.FLOAT, false, 0, 0);
		sphereColorBuffer.bind();
		shader.attributes.aColor.pointer(gl.FLOAT, false, 0, 0);
		mat4.identity(mMatrix);
		mat4.scale(mMatrix, mMatrix, new Float32Array([4.0, 4.0, 4.0]));
		mat4.rotate(mMatrix, mMatrix, rotateDeg, new Float32Array([0.0, 1.0, 0.0]));
		shader.uniforms.mMatrix = mMatrix;
		gl.drawArrays(gl.TRIANGLES, 0, sphereVertices.length / 3);
	});

	shell.on('gl-error', () => {
		throw new Error('我艹，侬浏览器不支持webGL');
	});
};