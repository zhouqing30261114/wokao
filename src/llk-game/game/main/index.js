import * as THREE from 'three';
import createOrbitControls from 'three-orbit-controls';
import store from '../../store';
import passConfig from '../pass-config';
import tools from '../tools';
import actions from '../../actions';
import getLinkPath from './link-path';

let scene, camera, renderer; // THREE三大组件
const OrbitControls = createOrbitControls(THREE); // 相机控制
const meshSize = 2; // 单元格的尺寸
let typeColors;

/**
 * 获取mesh坐标
 * @param {Object} item 单元格
 */
function getMeshPosition(item) {
	const state = store.getState();
	const passInfo = passConfig[state.pass - 1];
	const x = (item.x - passInfo.size.l / 2 + 0.5) * meshSize;
	const y = (item.y - passInfo.size.w / 2 + 0.5) * meshSize;
	const z = (item.z - passInfo.size.h / 2 + 0.5) * meshSize;
	return new THREE.Vector3(x, y, z);
}

/**
 * 更新相机
 */
function updateCamera(state) {
	const passInfo = passConfig[state.pass - 1];
	const p = Math.max(passInfo.size.l, passInfo.size.w, passInfo.size.h);
	camera.position.set(
		meshSize * p,
		meshSize * p,
		meshSize * p
	);
	camera.up.set(0, 1, 0);
	camera.lookAt(new THREE.Vector3());
	const orbitControls = new OrbitControls( camera, renderer.domElement );
	orbitControls.enableZoom = false;
	orbitControls.enableKeys = false;
	orbitControls.enablePan = false;
}

/**
 * 删除所有单元格Mesh
 */
function clearItems() {
	const removeMeshList = [];
	let i, len;
	for (i = 0, len = scene.children.length; i < len; i++) {
		const child = scene.children[i];
		if ((child.type === 'Mesh' && child.modelData) || child.type === 'Line') {
			removeMeshList.push(child);
		}
	}
	for (i = 0; i < removeMeshList.length; i++) {
		scene.remove(removeMeshList[i]);
	}
}

/**
 * 绘制连接线
 * @param {array} linkList 单元格数组 
 */
function createJoinLine(linkList) {
	const lineGeom = new THREE.Geometry();
	linkList.forEach((item) => {
		const meshPosition = getMeshPosition(item);
		lineGeom.vertices.push(meshPosition);
	});
	return new THREE.Line(
		lineGeom,
		new THREE.LineBasicMaterial({
			color: 0xffffff,
			linewidth: 5,
		}),
	);
}

/**
 * 渲染棋盘
 * @param {object} state store状态 
 */
function renderItems(state) {
	clearItems();
	state.items
		.filter(item => Boolean(item.type))
		.forEach((item) => {
			let mesh = new THREE.Mesh(
				new THREE.BoxGeometry( meshSize, meshSize, meshSize ),
				new THREE.MeshBasicMaterial({
					color: typeColors[item.type],
				}),
			);
			if (Boolean(item.checked)) {
				mesh.material.transparent = true;
				mesh.material.opacity = 0.6;
			}
			const meshPosition = getMeshPosition(item);
			mesh.position.set(meshPosition.x, meshPosition.y, meshPosition.z);
			mesh.modelData = item; // 将数据放到mesh的属性中
			scene.add(mesh);
		});
		if (state.linkedItems.length > 0) {
			const lineMesh = createJoinLine(state.linkedItems);
			scene.add(lineMesh);
		}
}

function onPassChangeHandler() {
	const state = store.getState();
	typeColors = tools.getRandomColors(passConfig[state.pass - 1].types);
	updateCamera(state);
	renderItems(state);
}

/**
 * 初始化3D场景
 */
function init3D() {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
	renderer = new THREE.WebGLRenderer({
		antialias: true,
	});
	renderer.setSize( window.innerWidth, window.innerHeight );
	this.el.appendChild( renderer.domElement );
}

function initStore() {
	let prevState = store.getState();
	this.unsubscribe = store.subscribe(function() {

		if (lock) {
			return;
		}

		const state = store.getState();

		// 关卡变化了
		if (state.pass !== prevState.pass) {
			onPassChangeHandler();
		} else if (
			state.pass > 0 &&
			typeColors &&
			(
				JSON.stringify(state.items) !== JSON.stringify(prevState.items) ||
				JSON.stringify(state.linkedItems) !== JSON.stringify(prevState.linkedItems)
			)
		) {
			renderItems(state);
		}

		prevState = state;
	});
}

function onCanvasClickHandler(ev) {
	let state = store.getState();
	let checkedItems = state.items.filter(item => Boolean(item.checked));

	// 更新鼠标位置
	const mouse = new THREE.Vector2();
	mouse.x = ( ev.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( ev.clientY / window.innerHeight ) * 2 + 1;

	// 射线
	const raycaster = new THREE.Raycaster();
	raycaster.setFromCamera(mouse, camera);
	const intersects = raycaster.intersectObjects(scene.children);

	// 射线没射到任何mesh，什么也不做
	if (!intersects.length) {
		return;
	}

	// 手速太快
	if (checkedItems.length === 2) {
		return;
	}

	// 射线射到的第一个mesh作为选中的mesh
	const checkedMesh = intersects[0].object;

	// 第一次点击
	if (checkedItems.length === 0) {
		store.dispatch({
			type: actions.UPDATE_ITEM_CHECKED,
			id: checkedMesh.modelData.id,
			value: true,
		});
	}
	// 第二次点击
	else {
		// 获取连通路径
		const linkedItems = getLinkPath(checkedItems[0], checkedMesh.modelData, state.items);
		// 没找到连通路径，取消所有的选中状态
		if (linkedItems.length === 0) {
			state.items.filter(item => item.checked).forEach((item) => {
				store.dispatch({
					type: actions.UPDATE_ITEM_CHECKED,
					id: item.id,
					value: false,
				});
			});
		}
		// 找到了连通路径
		else {
			lock = true;
			store.dispatch({
				type: actions.UPDATE_ITEM_CHECKED,
				id: checkedMesh.modelData.id,
				value: true,
			});
			store.dispatch({
				type: actions.UPDATE_LINKED_ITEMS,
				value: linkedItems,
			});
			lock = false;
			// 延迟消除mesh以展示牛逼效果
			setTimeout(function() {
				state = store.getState();
				checkedItems = state.items.filter(item => Boolean(item.checked));
				lock = true;
				checkedItems.forEach((item) => {
					store.dispatch({
						type: actions.UPDATE_ITEM_TYPE,
						id: item.id,
						value: '',
					})
				});
				state.items.filter(item => item.checked).forEach((item) => {
					store.dispatch({
						type: actions.UPDATE_ITEM_CHECKED,
						id: item.id,
						value: false,
					});
				});
				store.dispatch({
					type: actions.UPDATE_LINKED_ITEMS,
					value: [],
				});
				lock = false;
			}, 0.2e3);
		}
	}
}

function initEvents() {
	this.el.querySelector('canvas').addEventListener('click', onCanvasClickHandler, false);
}

/**
 * 渲染循环
 */
function renderLoop() {
	renderer.clear();
	renderer.render(scene, camera);
	requestAnimationFrame(renderLoop);
}

function init() {
	init3D.call(this);
	initEvents.call(this);
	initStore.call(this);
	renderLoop();
}

class Main extends THREE.EventDispatcher {
	constructor(el) {
		super();
		this.el = el;
		init.call(this);
	}
	resetItems() {
		const state = store.getState();
		store.dispatch({
			type: actions.UPDATE_ITEMS,
			value: tools.getReTypedItemList(state.items),
		});
	}
}

export default Main;
