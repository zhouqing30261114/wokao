import store from './store';
import passConfig from './pass-config';
import view from './view';
import game from './game';
import * as THREE from 'three';

// 欢迎/结束
const PAGE_WELCOME = 'welcome';
const PAGE_GAMEOVER = 'gameover';

// 最近一次store
let prevState = {};

store.subscribe(function() {
	const state = store.getState();
	
	// 关卡变化
	if (state.pass !== prevState.pass) {
		passChangeHandler(state.pass, state, prevState);
	}

	prevState = state;
});

gotoPass(PAGE_WELCOME);

function passChangeHandler(pass, state, prevState) {
	const passInfo = passConfig[pass];
	// 渲染欢迎页
	if (passInfo === PAGE_WELCOME) {
		view.renderWelcomePage();
		// 点击开始游戏按钮，跳到第一关
		let startBtn = document.getElementById('startBtn');
		startBtn.addEventListener('click', function() {
			gotoPass(1);
			startBtn.removeEventListener('click');
			startBtn = null;
		}, false);
	}
	// 渲染结束页
	else if (passInfo === PAGE_GAMEOVER) {
		view.renderGameOverPage();
		let startBtn = document.getElementById('startBtn');
		let replayBtn = document.getElementById('replayBtn');
		// 点击重新开始按钮，跳到第一关
		startBtn.addEventListener('click', function() {
			gotoPass(1);
			startBtn.removeEventListener('click');
			startBtn = null;
		}, false);
		// 点击再来一次按钮，再次挑战
		replayBtn.addEventListener('click', function() {
			gotoPass(prevState.pass);
			replayBtn.removeEventListener('click');
			replayBtn = null;
		}, false);
	}
	// 渲染游戏页
	else {
		view.renderGamePage();
		game();
	}
}

function gotoPass(pass) {
	store.dispatch({
		type: 'UPDATE_PASS',
		value: pass,
	});
}


// class Test extends THREE.EventDispatcher {
// 	constructor() {
// 		super();
// 	}
// 	abc() {
// 		this.dispatchEvent({ type: 'start', message: 'vroom vroom!' });
// 	}
// }

// const test = new Test();

// test.addEventListener('start', function(ev) {
// 	console.log(ev);
// })

// test.abc();

