import * as THREE from 'three';
import createOrbitControls from 'three-orbit-controls';

let scene, camera, renderer, controls;
const OrbitControls = createOrbitControls(THREE);

const initScene = () => {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
	camera.position.set(0, 0, 5);
	camera.up.set(0, 1, 0);
	camera.lookAt(new THREE.Vector3());
	renderer = new THREE.WebGLRenderer({
		antialias: true,
	});
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
	renderer.domElement.style.cssText += `
		position: absolute;
		top: 0;
		left: 0;
	`;
	controls = new OrbitControls( camera, renderer.domElement );
	
	const cube = new THREE.Mesh(
		new THREE.BoxGeometry( 1, 1, 1 ),
		new THREE.MeshBasicMaterial({
			color: 0x00ff00,
		}),
	);
	cube.position.set(-1, 0, 0);

	const sphere = new THREE.Mesh(
		new THREE.SphereGeometry(0.5, 4, 4),
		new THREE.MeshBasicMaterial({
			color: 0xff0000,
		}),
	);
	sphere.position.set(1, 0, 0);

	scene.add(cube);
	scene.add(sphere);
};

const renderLoop = () => {
	renderer.clear();
	renderer.render(scene, camera);
	requestAnimationFrame(renderLoop);
};

export default () => {
	initScene();
	renderLoop();
};
