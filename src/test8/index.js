/**
 * fbo测试
 */
import glNow from 'gl2-now';
import createShader from 'gl-shader';
import createFBO from 'gl-fbo';
import createGeometry from 'gl-geometry';
import createPlane from 'primitive-plane';
import createSphere from 'primitive-sphere';
import createTexture2d from 'gl-texture2d';
import createTextureCube from 'gl-texture-cube';
import createCamera from 'perspective-camera';
import { mat4 } from 'gl-matrix';
import tools from '../common/tools';
import plane_vs from './shader/plane.vs';
import plane_fs from './shader/plane.fs';
import sphere_vs from './shader/sphere.vs';
import sphere_fs from './shader/sphere.fs';
import img_url from './img/brick-diffuse.jpg';
import pos_x_img_url from './img/pos-x.jpg';
import pos_y_img_url from './img/pos-y.jpg';
import pos_z_img_url from './img/pos-z.jpg';
import neg_x_img_url from './img/neg-x.jpg';
import neg_y_img_url from './img/neg-y.jpg';
import neg_z_img_url from './img/neg-z.jpg';

const startTime = new Date();
const plane = createPlane();
const sphere = createSphere(1, {
	segments: 6,
});

let camera, fbo, fboCamera, off_screen_width, off_screen_height;
let planeShader, planeGeom, planeTexture;
let sphereShader, sphereGeom, sphereTexture;

const initCamera = (gl) => {
	camera = createCamera({
		fov: Math.PI / 4,
		near: 0.1,
		far: 100.0,
		viewport: [0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight],
	});
	fboCamera = createCamera({
		fov: Math.PI / 4,
		near: 0.1,
		far: 100.0,
		viewport: [0, 0, off_screen_width, off_screen_height],
	});
};

const updateCamera = (gl) => {
	// const timeOffset = new Date() - startTime;
	// const deg = timeOffset * 0.0001;
	// const r = 4.0; // 相机半径
	// const x = r * Math.cos(deg);
	// const y = r * Math.cos(deg);
	// const z = r * Math.sin(deg);

	// camera.identity();
	// camera.translate([x, y, z]);
	// camera.lookAt([0, 0, 0]);
	// camera.update();

	camera.identity();
	camera.translate([0, 0, 3]);
	camera.lookAt([0, 0, 0]);
	camera.update();

	// fboCamera.identity();
	// fboCamera.translate([0, 0, 3]);
	// fboCamera.lookAt([0, 0, 0]);
	// fboCamera.update();
};

const initPlane = (gl) => {
	planeShader = createShader(gl, plane_vs, plane_fs);
	planeGeom = createGeometry(gl)
		.attr('position', plane.positions)
		.attr('uv', plane.uvs, { size: 2 })
		.faces(plane.cells);
	tools.loadImage(img_url).then((img) => {
		planeTexture = createTexture2d(gl, img);
		gl.bindTexture(gl.TEXTURE_2D, null);
	});
};

const drawPlane = (gl) => {
	gl.disable(gl.CULL_FACE);
	const model = mat4.create();

	// 绑定fbo纹理
	const fboTexture = fbo.color[0];
	fboTexture.bind();

	planeShader.bind();
	planeShader.uniforms = {
		projection: camera.projection,
		view: camera.view,
		model: model,
		texture: fboTexture, // 将fbo中绘制的内容作为纹理
	};
	planeGeom.bind(planeShader);
	planeGeom.draw(gl.TRIANGLES);
	planeGeom.unbind();
	gl.bindTexture(gl.TEXTURE_2D, null);
};

const initSphere = (gl) => {
	sphereShader = createShader(gl, sphere_vs, sphere_fs);
	sphereGeom = createGeometry(gl)
		.attr('position', sphere.positions)
		.attr('uv', sphere.uvs, { size: 2 })
		.faces(sphere.cells);
	tools.loadImageList([
		pos_x_img_url, pos_y_img_url, pos_z_img_url,
		neg_x_img_url, neg_y_img_url, neg_z_img_url
	]).then((values) => {
		sphereTexture = createTextureCube(gl, {
			pos: { x: values[0], y: values[1], z: values[2] },
			neg: { x: values[3], y: values[4], z: values[5] },
		});
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
	});
};

const drawSphere = (gl) => {
	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.BACK);
	const model = mat4.create();
	mat4.scale(model, model, new Float32Array([0.5, 0.5, 0.5]));
	sphereShader.bind();
	sphereShader.uniforms = {
		// projection: fboCamera.projection,
		// view: fboCamera.view,
		projection: camera.projection,
		view: camera.view,
		model: model,
	};
	if (sphereTexture) {
		sphereTexture.bind();
		sphereShader.uniforms.texture = sphereTexture;
	}
	sphereGeom.bind(sphereShader);
	sphereGeom.draw(gl.TRIANGLES);
	sphereGeom.unbind();
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
};

export default () => {
	const shell = glNow({
		clearColor: [0.0, 0.0, 0.0, 1.0],
	});
	shell.on('gl-init', () => {
		const gl = shell.gl;
		gl.enable(gl.DEPTH_TEST);

		off_screen_width = gl.drawingBufferWidth;
		off_screen_height = gl.drawingBufferWidth;
		fbo = createFBO(gl, [off_screen_width, off_screen_height]);

		initCamera(gl);
		initSphere(gl);
		initPlane(gl);
	});
	shell.on('gl-render', () => {
		const gl = shell.gl;
		updateCamera(gl);

		// 在fbo中画球
		fbo.bind();
		gl.viewport(0, 0, off_screen_width, off_screen_height);
		drawSphere(gl);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null); // 离屏绘制结束

		// 正常绘制平面
		gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
		drawPlane(gl);
	});
	shell.on('gl-resize', () => {

	});
	shell.on('gl-error', () => {
		throw new Error('我艹，侬浏览器不支持webGL');
	});
};