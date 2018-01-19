import store from './store';
import passConfig from './pass-config';
import tools from './tools';
import * as THREE from 'three';
import createOrbitControls from 'three-orbit-controls';
import './style.less';

let scene, camera, renderer; // THREE三大组件
const OrbitControls = createOrbitControls(THREE); // 相机控制
const mouse = new THREE.Vector2(); // 鼠标位置
const raycaster = new THREE.Raycaster(); // 射线
const meshSize = 2; // mesh的尺寸
let colors;
let pass = 1;
let countDown;

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
 * 状态栏
 */
function initStateHtml() {
	const div = document.createElement('div');
	div.setAttribute('class', 'state-container');
	div.innerHTML = `
		<span class="pass-info"></span>
		<span class="time-info" id="time-info"></span>
	`;
	document.body.appendChild(div);
}

/**
 * 初始化html
 * 1、防止手势缩放
 * 2、使用DOM渲染状态栏和控制栏
 */
function initHtml() {
	const metaNode = document.createElement('meta');
	metaNode.setAttribute('name', 'viewport');
	metaNode.setAttribute('content', 'user-scalable=no');
	document.head.appendChild(metaNode);
}

/**
 * 初始化THREE三大组件
 */
function initTHREE() {
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
	`;
}

function initStore() {
	const state = store.getState();
	let prevPassInfo = state.passInfo;
	let prevItemList = state.itemList;
	let prevLinkedItems = state.linkedItems;
	let prevTimeLeft = state.timeLeft;

	// 监听数据变化
	store.subscribe(function() {
		const state = store.getState();

		// 数据不完整状态不处理
		const isCompletedData = state.passInfo.size &&
			state.itemList.length > 0 &&
			state.passInfo.size.l * state.passInfo.size.w * state.passInfo.size.h === state.itemList.length;
		if (!isCompletedData) {
			return;
		}
		// 关卡变化
		if (state.passInfo !== prevPassInfo) {
			colors = tools.getRandomColors(state.passInfo.types);
			updateCamera();
			document.querySelector('.pass-info').innerText = state.passInfo.title;
		}
		
		// 渲染倒计时
		if (prevTimeLeft !== state.timeLeft) {
			const leftTimeStr = tools.formatTime(state.timeLeft, 'mm:ss');
			document.querySelector('.time-info').innerText = leftTimeStr;
		}

		// 数据变化渲染视图
		if (
			JSON.stringify(state.itemList) !== JSON.stringify(prevItemList) ||
			JSON.stringify(state.linkedItems) !== JSON.stringify(prevLinkedItems)
		) {
			updateMesh();
		}

		prevPassInfo = state.passInfo;
		prevItemList = state.itemList;
		prevLinkedItems = state.linkedItems;
		prevTimeLeft = state.timeLeft;

		const isItemsEmpty = (state.itemList.filter(item => Boolean(item.type)).length === 0) &&
			state.linkedItems.length === 0;

		// 赢
		if (isItemsEmpty) {
			countDown.stop();
			countDown.clear();
			clearStore();
			// alert('win');
			if (pass < 3) {
				pass += 1;
			} else {
				pass = 1;
			}
			gotoPass(pass);
		}

		// 输
		if (
			state.timeLeft === 0 &&
			(state.itemList.filter(item => Boolean(item.type)).length > 0)
		) {
			alert('game over');
			window.location.reload();
		}

	});
}

/**
 * 清理store
 */
function clearStore() {
	store.dispatch({
		type: 'UPDATE_PASS_INFO'
	});
	store.dispatch({
		type: 'UPDATE_TIME_LEFT'
	});
	store.dispatch({
		type: 'UPDATE_ITEM_LIST'
	});
	store.dispatch({
		type: 'UPDATE_LINKED_ITEMS'
	});
}

/**
 * 获取mesh坐标
 * @param {Object} a 单元格
 */
function getMeshPosition(a) {
	const state = store.getState();
	const x = (a.x - state.passInfo.size.l / 2 + 0.5) * meshSize;
	const y = (a.y - state.passInfo.size.w / 2 + 0.5) * meshSize;
	const z = (a.z - state.passInfo.size.h / 2 + 0.5) * meshSize;
	return new THREE.Vector3(x, y, z);
}

/**
 * 更新相机
 */
function updateCamera() {
	const state = store.getState();
	const p = Math.max(state.passInfo.size.l, state.passInfo.size.w, state.passInfo.size.h);
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
function clearMesh() {
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
			linewidth: 20,
		}),
	);
}

/**
 * 更新棋盘mesh
 */
function updateMesh() {
	clearMesh();
	const state = store.getState();
	state.itemList
		.filter(item => Boolean(item.type))
		.forEach((item) => {
			let mesh = new THREE.Mesh(
				new THREE.BoxGeometry( meshSize, meshSize, meshSize ),
				new THREE.MeshBasicMaterial({
					color: colors[item.type],
				}),
			);
			if (Boolean(item.checked)) {
				mesh.material.transparent = true;
				mesh.material.opacity = 0.6;
			}
			if (state.linkedItems.length > 0) {
				const lineMesh = createJoinLine(state.linkedItems);
				scene.add(lineMesh);
			}
			const meshPosition = getMeshPosition(item);
			mesh.position.set(meshPosition.x, meshPosition.y, meshPosition.z);
			mesh.modelData = item; // 将数据放到mesh的属性中
			scene.add(mesh);
			mesh = null;
	});
}

/**
 * 渲染循环
 */
function renderLoop() {
	renderer.clear();
	renderer.render(scene, camera);
	requestAnimationFrame(renderLoop);
}

function clickCanvasHandler(ev) {
	let state = store.getState();
	let checkedItems = state.itemList.filter(item => Boolean(item.checked));
	// 更新鼠标位置
	mouse.x = ( ev.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( ev.clientY / window.innerHeight ) * 2 + 1;
	// 射线射到的mesh列表
	raycaster.setFromCamera(mouse, camera);
	const intersects = raycaster.intersectObjects(scene.children);
	// 射线没射到任何mesh，什么也不做
	if (!intersects.length) {
		return;
	}
	// 猴急了
	if (checkedItems.length === 2) {
		return;
	}
	// 射线射到的第一个mesh作为选中的mesh
	const checkedMesh = intersects[0].object;
	if (checkedItems.length === 0) {
		store.dispatch({
			type: 'UPDATE_ITEM_CHECKED',
			id: checkedMesh.modelData.id,
			value: true,
		});
	} else {
		// 获取连通路径（连通单元格数组）
		const linkedItemList = tools.getLinkPath(checkedItems[0], checkedMesh.modelData, state.itemList);
		// 没找到连通路径，取消所有的选中状态
		if (linkedItemList.length === 0) {
			state.itemList.filter(item => item.checked).forEach((item) => {
				store.dispatch({
					type: 'UPDATE_ITEM_CHECKED',
					id: item.id,
					value: false,
				});
			});
		}
		// 找到了连通路径
		else {
			store.dispatch({
				type: 'UPDATE_ITEM_CHECKED',
				id: checkedMesh.modelData.id,
				value: true,
			});
			store.dispatch({
				type: 'UPDATE_LINKED_ITEMS',
				value: linkedItemList,
			});
			// 延迟消除mesh以展示牛逼效果
			setTimeout(function() {
				state = store.getState();
				checkedItems = state.itemList.filter(item => Boolean(item.checked));
				checkedItems.forEach((item) => {
					store.dispatch({
						type: 'UPDATE_ITEM_TYPE',
						id: item.id,
						value: '',
					})
				});
				state.itemList.filter(item => item.checked).forEach((item) => {
					store.dispatch({
						type: 'UPDATE_ITEM_CHECKED',
						id: item.id,
						value: false,
					});
				});
				store.dispatch({ type: 'CLEAR_LINKED_ITEMS' });
				// console.log(store.getState());
			}, 1e3)
		}
	}
	// console.log(store.getState());
}

function clickResetBtnHandler() {
	const state = store.getState();
	const value = tools.getReTypedItemList(state.itemList);
	store.dispatch({
		type: 'UPDATE_ITEM_LIST',
		value: value,
	});
}

/**
 * click事件代理
 */
function clickHandler(ev) {
	if (ev.target.nodeName.toLowerCase() === 'canvas') {
		clickCanvasHandler(ev);
	} else if (ev.target.className === 'reset-btn') {
		clickResetBtnHandler();
	}
}

function initEvents() {
	document.addEventListener('click', clickHandler, false);
	window.onresize = function(ev) {
		initTHREE();
		updateCamera();
		updateMesh();
	};
}

function activeMesh(mesh) {
	mesh.material.transparent = true;
	mesh.material.opacity = 0.6;
}

function disActiveMesh(mesh) {
	mesh.material.transparent = false;
	mesh.material.opacity = 1;
}

function gotoPass(pass) {
	const passInfo = passConfig[pass - 1];
	store.dispatch({
		type: 'UPDATE_PASS_INFO',
		value: passInfo,
	});
	countDown = tools.countDown2(passInfo.timeLeft, function(s){
		store.dispatch({
			type: 'UPDATE_TIME_LEFT',
			value: s,
		});
	});
	store.dispatch({
		type: 'UPDATE_TIME_LEFT',
		value: passInfo.timeLeft,
	});
	store.dispatch({
		type: 'UPDATE_ITEM_LIST',
		value: tools.createItemList(passInfo),
	});
	countDown.start();
}

/**
 * 入口
 */
export default () => {
	initHtml();
	initTHREE();
	initControlHtml();
	initStateHtml();
	initEvents();
	initStore();
	renderLoop();

	// 跳到第一关
	gotoPass(pass);
	
};
