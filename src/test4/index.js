import gl2Now from 'gl2-now';
import createBuffer from 'gl-buffer';
import createVAO from 'gl-vao';
import createShader from 'gl-shader';

export default () => {
	const shell = gl2Now({
		clearColor: [0.0, 0.0, 0.0, 1.0],
	});
	let shader, pointBuffer, triangleBuffer, vao;
	shell.on('gl-init', () => {
		const gl = shell.gl;
		shader = createShader(
			gl,
			`
			attribute vec3 position;
			void main() {
				gl_Position = vec4(position, 1.0);
				gl_PointSize = 10.0;
			}
			`,
			`
			precision mediump float;
			void main() {
				gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
			}
			`
		);
		pointBuffer = createBuffer(gl, new Float32Array([
			+0.5, +0.5, +0.0
		]));
		triangleBuffer = createBuffer(gl, new Float32Array([
			+0.0, +1.0, +0.0,
			-1.0, -1.0, +0.0,
			+1.0, -1.0, +0.0
		]));
		vao = createVAO(gl, [{
			buffer: triangleBuffer,
			type: gl.FLOAT,
			size: 3,
		}]);
	});
	shell.on('gl-render', () => {
		const gl = shell.gl;
		
		// pointShader.bind();
		// pointBuffer.bind();
		// pointShader.attributes.position.pointer(gl.FLOAT, false, 0, 0);
		// gl.drawArrays(gl.POINTS, 0, 1);

		shader.bind();
		vao.bind();
		vao.draw(gl.TRIANGLES, 3);
		vao.unbind();
	});
};
