import gl2Now from 'gl2-now';
import glslify from 'glslify'; // 赋予着色器模块化的能力
import createBuffer from 'gl-buffer';
import createShader from 'gl-shader';
import createCamera from 'perspective-camera';
import createGeometry from 'gl-geometry';
import createTexture2d from 'gl-texture2d';
import { mat4, vec3 } from 'gl-matrix';
import createTorus from 'primitive-torus';
import vShaderSourceOfTorus from './torus-shader.vs';
import fShaderSourceOfTorus from './torus-shader.fs';
import wallImageUrl from './brick-diffuse.jpg';
import jadeImageUrl from './jade.jpg';

export default () => {

	const torusMesh = createTorus();
	let torusShader, torusGeom, camera, texture;

	const shell = gl2Now({
		clearColor: [0.0, 0.0, 0.0, 1.0],
	});
	shell.on('gl-init', () => {
		const gl = shell.gl;
		gl.enable(gl.CULL_FACE);
		torusShader = createShader(gl, glslify(vShaderSourceOfTorus), glslify(fShaderSourceOfTorus));
		torusGeom = createGeometry(gl)
			.attr('position', torusMesh.positions)
			.attr('normal', torusMesh.normals)
			.attr('uv', torusMesh.uvs, {
				size: 2,
			})
			.faces(torusMesh.cells);

		camera = createCamera({
			fov: Math.PI / 4,
			near: 0.1,
			far: 100.0,
			viewport: [0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight],
		});
		camera.identity();
		camera.translate([5, 0, 5]);
		camera.lookAt([0, 0, 0]);
		camera.update();

		const image = new Image();
		image.src = jadeImageUrl;
		// image.src = wallImageUrl;
		image.onload = () => {
			texture = createTexture2d(gl, image);
			texture.wrap = gl.REPEAT;
		};
	});
	shell.on('gl-render', () => {
		const gl = shell.gl;

		torusShader.bind();
		torusShader.uniforms.projection = camera.projection;
		torusShader.uniforms.view = camera.view;
		torusShader.uniforms.model = mat4.create();
		if (texture) {
			torusShader.uniforms.texture = texture;
		}
		
		torusGeom.bind(torusShader);
		torusGeom.draw(gl.TRIANGLES);
		torusGeom.unbind();
	});
	shell.on('gl-resize', () => {

	});
	shell.on('gl-error', () => {
		throw new Error('我艹，侬浏览器不支持webGL');
	});
};
