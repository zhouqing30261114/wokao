/**
 * 立方体纹理在球上的测试
 */
import glNow from 'gl2-now';
import createShader from 'gl-shader';
import createSphere from 'primitive-sphere';
import createGeometry from 'gl-geometry';
import createTextureCube from 'gl-texture-cube';
import { mat4, vec3 } from 'gl-matrix';
import createCamera from 'perspective-camera';
import tools from '../common/tools';
import sky_vs from './shader/sky.vs';
import sky_fs from './shader/sky.fs';
import pos_x_img_url from './img/pos-x.jpg';
import pos_y_img_url from './img/pos-y.jpg';
import pos_z_img_url from './img/pos-z.jpg';
import neg_x_img_url from './img/neg-x.jpg';
import neg_y_img_url from './img/neg-y.jpg';
import neg_z_img_url from './img/neg-z.jpg';

const startTime = new Date();
const ball = createSphere(1, {
	segments: 8,
});
let camera;
let ballShader, ballGeom, ballTexture;

const drawBall = (gl) => {
	gl.cullFace(gl.BACK); // 禁用背面的渲染
	let model = mat4.create();
	mat4.scale(model, model, new Float32Array([0.2, 0.2, 0.2]));
	ballShader.bind();
	ballShader.uniforms = {
		projection: camera.projection,
		view: camera.view,
		model: model,
		texture: ballTexture,
	};
	ballGeom.bind(ballShader);
	ballGeom.draw(gl.TRIANGLES);
	ballGeom.unbind();
};
const updateCamera = (gl) => {
	const timeOffset = new Date() - startTime;
	const deg = timeOffset * 0.0001;
	const r = 2.0; // 相机半径
	const x = r * Math.cos(deg);
	const y = 0.0;
	const z = r * Math.sin(deg);
	camera.identity();
	camera.translate([x, y, z]);
	camera.lookAt([0, 0, 0]);
	camera.update();
};

export default () => {
	const shell = glNow({
		clearColor: [0.0, 0.0, 0.0, 1.0],
	});
	shell.on('gl-init', () => {
		const gl = shell.gl;
		gl.enable(gl.CULL_FACE);
		gl.enable(gl.DEPTH_TEST);
		// 初始化相机
		camera = createCamera({
			fov: Math.PI / 4,
			near: 0.1,
			far: 100.0,
			viewport: [0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight],
		});
		// 初始化球
		ballShader = createShader(gl, sky_vs, sky_fs);
		ballGeom = createGeometry(gl)
			.attr('position', ball.positions)
			.faces(ball.cells);
		tools.loadImageList([
			pos_x_img_url, pos_y_img_url, pos_z_img_url,
			neg_x_img_url, neg_y_img_url, neg_z_img_url
		]).then((values) => {
				ballTexture = createTextureCube(gl, {
					pos: { x: values[0], y: values[1], z: values[2] },
					neg: { x: values[3], y: values[4], z: values[5] },
				});
			});
	});
	shell.on('gl-render', () => {
		const gl = shell.gl;
		updateCamera(gl); // 更新运动着的相机
		drawBall(gl); // 绘制球
	});
	shell.on('gl-resize', () => {

	});
	shell.on('gl-error', () => {
		throw new Error('我艹，侬浏览器不支持webGL');
	});
};
