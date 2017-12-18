import gl2Now from 'gl2-now';
import createBuffer from 'gl-buffer';
// import createVAO from 'gl-vao';
import glslify from 'glslify'; // 赋予着色器模块化的能力
import createShader from 'gl-shader';
import createCamera from 'perspective-camera';
import createGeometry from 'gl-geometry';
import normals from 'normals'; // 计算法向量的工具
import icosphere from 'icosphere'; // 正26面体
import { mat4, vec3 } from 'gl-matrix';
import vShaderSource from './shader.vs';
import fShaderSource from './shader.fs';

const startTime = new Date();
let shader, geom, camera, pointShader, pointBuffer;
const sphereMesh = icosphere();

export default () => {
	const shell = gl2Now({
		clearColor: [0.0, 0.0, 0.0, 1.0],
	});
	let lightPosition = new Float32Array([2.0, 2.0, 2.0]);
	shell.on('gl-init', () => {
		const gl = shell.gl;
		gl.enable(gl.CULL_FACE);
		shader = createShader(
			gl,
			glslify(vShaderSource, {inline: true}),
			glslify(fShaderSource, {inline: true})
		);
		pointShader = createShader(
			gl,
			`
			attribute vec3 position;
			uniform mat4 projection;
			uniform mat4 view;
			void main() {
				gl_Position = projection * view * vec4(position, 1.0);
				gl_PointSize = 10.0;
			}
			`,
			`
			precision mediump float;
			void main() {
				gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
			}
			`
		);

		const sphereNormals = normals.vertexNormals(sphereMesh.cells, sphereMesh.positions);
		geom = createGeometry(gl)
			.attr('position', sphereMesh.positions)
			.attr('normal', sphereNormals)
			.faces(sphereMesh.cells);

		camera = createCamera({
			fov: Math.PI / 4,
			near: 0.1,
			far: 100.0,
			viewport: [0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight]
		});

		pointBuffer = createBuffer(gl, lightPosition);

	});
	shell.on('gl-render', () => {
		const gl = shell.gl;

		const time = new Date() - startTime;
		const deg = time * 0.001;
		const r = 10.0;
		const x = r * Math.cos(deg);
		const y = 0.0;
		const z = r * Math.sin(deg);
		
		camera.identity();
		camera.translate([x, y, z]);
		camera.lookAt([0, 0, 0]);
		camera.update();

		shader.bind();
		shader.uniforms.projection = camera.projection;
		shader.uniforms.view = camera.view;
		shader.uniforms.model = mat4.create();
		shader.uniforms.color = new Float32Array([1.0, 0.0, 0.0]);
		shader.uniforms.lightPosition = lightPosition;

		geom.bind(shader);
		geom.draw(gl.TRIANGLES);
		geom.unbind();

		pointShader.bind();
		pointShader.uniforms.projection = camera.projection;
		pointShader.uniforms.view = camera.view;
		pointBuffer.bind();
		pointShader.attributes.position.pointer(gl.FLOAT, false, 0, 0);
		gl.drawArrays(gl.POINTS, 0, 1);

	});
	shell.on('gl-error', () => {
		throw new Error('我艹，侬浏览器不支持webGL');
	});
}