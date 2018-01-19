import glNow from 'gl2-now';
import * as BABYLON from 'babylonjs';

let engine;

export default () => {
	const shell = glNow();
	shell.on('init', () => {
		const gl = shell.gl;
		const canvas = shell.canvas;
		engine = new BABYLON.Engine(canvas, true);
		const createScene = () => {
				const scene = new BABYLON.Scene(engine);
				const camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, BABYLON.Vector3.Zero(), scene);
				camera.attachControl(canvas, true);
				const light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);
				const light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(0, 1, -1), scene);
				const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter:2}, scene);
				return scene;
		};
		const scene = createScene();
		engine.runRenderLoop(function () {
			scene.render();
		});
	});
	shell.on('gl-resize', () => {
		if(engine) {
			engine.resize();
		}
	});
	shell.on('gl-error', () => {
		throw new Error('我艹，侬浏览器不支持webGL');
	});

};