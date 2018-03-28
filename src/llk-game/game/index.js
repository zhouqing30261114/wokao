import { EventDispatcher } from 'three';
import Msg from 'msg-modal/dist/msg';
import store from '../store';
import actions from '../actions';
import templ from './index.ejs';
import ControlBar from './control-bar/index';
import StateBar from './state-bar/index';
import Main from './main/index';
import tools from './tools';
import passConfig from './pass-config';
import './index.less';


function onResetItemsHandler() {
	this.main.resetItems();
}

function render() {
	this.el.innerHTML = templ();
	this.controlBar = new ControlBar(this.el.querySelector('.game-control'));
	this.stateBar = new StateBar(this.el.querySelector('.game-state'));
	this.main = new Main(this.el.querySelector('.game-content'));
}

function event() {
	this.controlBar.addEventListener('reset-items', onResetItemsHandler.bind(this));
}

function initStore() {
	let prevState = store.getState();
	this.unsubscribe = store.subscribe(() => {
		
		if (lock) {
			return;
		}

		const state = store.getState();

		// 单元格是否全部消除
		const isHaveNoTypedItems = state.items.length > 0 && state.items.every(item => !Boolean(item.type));
		// 是否游戏失败
		const isGameOver = state.timeLeft === 0 &&  state.items.length > 0 && !isHaveNoTypedItems;

		// 单元格消尽，先暂停定时器，再跳到下一关
		if (isHaveNoTypedItems) {
			this.gotoNextPass();
		}

		if (isGameOver) {
			// 游戏失败，先暂停定时器，然后跳到失败页
			this.clearCountDown();
			this.dispatchEvent({
				type: 'game-over',
			});
		}

		prevState = state;
	});
}

class Game extends EventDispatcher {
	constructor(el) {
		super();
		this.el = el;
		this.countDown = null;
		render.call(this);
		event.call(this);
		initStore.call(this);
		this.gotoNextPass();
	}
	gotoNextPass() {
		this.clearCountDown(); // 先暂停倒计时
		const state = store.getState();
		const pass = state.pass + 1;
		const passInfo = passConfig[pass - 1];
		// 进入下一关
		if (passInfo) {

			const items = tools.getItems(passInfo);
			lock = true;
			store.dispatch({
				type: actions.UPDATE_ITEMS,
				value: items,
			});
			store.dispatch({
				type: actions.UPDATE_PASS,
				value: pass,
			});
			lock = false;

			this.resetCountDown(passInfo.timeLeft); // 重置倒计时

			// toast提示进入第二关，toast退出后开始倒计时
			const toast = Msg.factory({
				autoclose: true,
				autoclose_delay: 5e3,
				position: 'center',
				after_close: () => {
					this.countDown.start();
				}
			});
			toast.show(`${passInfo.title}`);
		}
		// 没有下一关表示通关了，上报给上级
		else {
			this.dispatchEvent({
				type: 'congratulate',
			});
		}
	}
	resetCountDown(ms) {
		this.clearCountDown();
		store.dispatch({
			type: actions.UPDATE_TIME_LEFT,
			value: ms,
		});
		this.countDown = tools.countDown(ms, (tl) => {
			// console.log(tl);
			store.dispatch({
				type: actions.UPDATE_TIME_LEFT,
				value: tl,
			});
		});
	}
	clearStoreSubscribe() {
		[this, this.controlBar, this.stateBar, this.main]
			.filter(obj => obj.unsubscribe)
			.forEach((obj) => {
				obj.unsubscribe();
			});
	}
	clearCountDown() {
		if (!this.countDown) {
			return;
		}
		this.countDown.stop();
		this.countDown = null;
	}
}

export default Game;
