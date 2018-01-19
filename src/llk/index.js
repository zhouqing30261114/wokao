import * as THREE from 'three';
import createOrbitControls from 'three-orbit-controls';
import Model from './model';
import style from './style.css';

let scene, camera, renderer; // THREE三大组件
const OrbitControls = createOrbitControls(THREE); // 相机控制
// const llkModel = new Model(); // 数据模型
const llkModel = new Model({ x: 4, y: 4, z: 4, types: 12 }); // 数据模型
// const llkModel = new Model({ x: 6, y: 6, z: 6, types: 16 }); // 数据模型
const mouse = new THREE.Vector2(); // 鼠标位置
const raycaster = new THREE.Raycaster(); // 射线
let oddMesh, evenMesh; // 奇偶次选中的mesh
const meshSize = 2; // mesh的尺寸
const colors = getRandomColors();

/**
 * 生成随机颜色
 */
function getRandomColors() {
	let colors = [];
	for (let i = 0; i < llkModel.types; i++) {
		colors.push(Math.random() * 0xffffff << 0);
	}
	return colors;
}

/**
 * 获取mesh坐标
 * @param {Object} a 数据点
 */
function getMeshPosition(a) {
	const x = (a.x - llkModel.x / 2 + 0.5) * meshSize;
	const y = (a.y - llkModel.y / 2 + 0.5) * meshSize;
	const z = (a.z - llkModel.z / 2 + 0.5) * meshSize;
	return new THREE.Vector3(x, y, z);
}

/**
 * 初始化mesh
 */
function initMesh() {
	llkModel.data
		.filter(item => Boolean(item.type))
		.forEach((item) => {
			let mesh = new THREE.Mesh(
				new THREE.BoxGeometry( meshSize, meshSize, meshSize ),
				// new THREE.SphereGeometry( meshSize / 2, 12, 12 ),
				new THREE.MeshBasicMaterial({
					color: colors[item.type],
				}),
			);
			const meshPosition = getMeshPosition(item);
			mesh.position.set(meshPosition.x, meshPosition.y, meshPosition.z);
			mesh.modelData = item; // 将数据放到mesh的属性中
			scene.add(mesh);
			mesh = null;
	});
}

/**
 * 初始化场景
 */
function initScene() {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
	renderer = new THREE.WebGLRenderer({
		antialias: true,
	});
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
	renderer.domElement.style.cssText += `
		position: absolute;
		top: 0;
		left: 0;
		content-zooming: none;
		z-index: 1;
	`;
}

/**
 * 初始化相机
 */
function initCamera() {
	
	const p = Math.max(llkModel.x, llkModel.y, llkModel.z);
	camera.position.set(
		meshSize * p,
		meshSize * p,
		meshSize * p
	);
	// camera.position.set(8, 6, 8);
	camera.up.set(0, 1, 0);
	camera.lookAt(new THREE.Vector3());
	const orbitControls = new OrbitControls( camera, renderer.domElement );
	orbitControls.enableZoom = false;
	orbitControls.enableKeys = false;
	orbitControls.enablePan = false;
}

/**
 * 渲染循环
 */
function renderLoop() {
	renderer.clear();
	renderer.render(scene, camera);
	requestAnimationFrame(renderLoop);
}

function activeMesh(mesh) {
	mesh.material.transparent = true;
	mesh.material.opacity = 0.6;
}

function disActiveMesh(mesh) {
	mesh.material.transparent = false;
	mesh.material.opacity = 1;
}

function createJoinLine(linkList) {
	const lineGeom = new THREE.Geometry();
	linkList.forEach((item) => {
		const meshPosition = getMeshPosition(item);
		lineGeom.vertices.push(meshPosition);
	});
	return new THREE.Line(
		lineGeom,
		new THREE.LineBasicMaterial({
			// color: oddMesh.material.color,
			color: 0xffffff,
			linewidth: 20,
		}),
	);
}

/**
 * 事件监听
 */
function initEvents() {
	document.addEventListener('click', function(ev) {
		mouse.x = ( ev.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = - ( ev.clientY / window.innerHeight ) * 2 + 1;

		raycaster.setFromCamera(mouse, camera);
		const intersects = raycaster.intersectObjects(scene.children);
		// 射线没射到任何mesh
		if (!intersects.length) {
			return;
		}
		// 猴急了
		if (oddMesh && evenMesh) {
			return;
		}
		if (!oddMesh) {
			oddMesh = intersects[0].object;
			activeMesh(oddMesh);
		} else {
			evenMesh = intersects[0].object;
			const linkList = llkModel.getLinkPath(evenMesh.modelData, oddMesh.modelData); // 联通的路径，是包含所有联通点的数组
			if (linkList.length === 0) {
				disActiveMesh(oddMesh);
				evenMesh = null;
				oddMesh = null;
				return;
			}
			activeMesh(evenMesh);

			// 绘制连接线
			const lineMesh = createJoinLine(linkList);
			scene.add(lineMesh);

			// 延迟消除mesh以展示牛逼效果
			setTimeout(() => {
				scene.remove(oddMesh, evenMesh, lineMesh);
				llkModel.data.filter(item => item.id === oddMesh.modelData.id)[0].type = '';
				llkModel.data.filter(item => item.id === evenMesh.modelData.id)[0].type = '';
				evenMesh = null;
				oddMesh = null;
			}, 1e3);
		}
	}, false);

	document.querySelector('.reset-btn').addEventListener('click', function(ev) {
		const removeMeshList = [];
		let i, len;
		for (i = 0, len = scene.children.length; i < len; i++) {
			const child = scene.children[i];
			if (child.type === 'Mesh' && child.modelData) {
				removeMeshList.push(child);
			}
		}
		for (i = 0; i < removeMeshList.length; i++) {
			scene.remove(removeMeshList[i]);
		}

		llkModel.reOrderData();
		initMesh();
	}, false);

	window.onresize = (ev) => {
		initScene();
		initMesh();
		initCamera();
	};
}

/**
 * 控制栏
 */
function initControlHtml() {
	const div = document.createElement('div');
	div.setAttribute('class', 'control-container');
	div.innerHTML = `
		<span class="reset-btn">reset</span>
	`;
	document.body.appendChild(div);
}

/**
 * 初始化html，防止手势缩放
 */
function initHtml() {
	const metaNode = document.createElement('meta');
	metaNode.setAttribute('name', 'viewport');
	metaNode.setAttribute('content', 'user-scalable=no');
	document.head.appendChild(metaNode);

	initControlHtml();
}

/**
 * 入口
 */
export default () => {
	initHtml();
	initEvents();
	initScene();
	initMesh();
	initCamera();
	renderLoop();
};
