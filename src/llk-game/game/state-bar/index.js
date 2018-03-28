import { EventDispatcher } from 'three';
import store from '../../store';
import templ from './index.ejs';
import passConfig from '../pass-config';
import tools from '../tools';

function render() {
	this.el.innerHTML = templ();
}

function initStore() {
	let prevState = store.getState();
	this.unsubscribe = store.subscribe(() => {

		if (lock) {
			return;
		}

		const state = store.getState();

		// 关卡变化了
		if (state.pass !== prevState.pass) {
			this.el.querySelector('.pass-title').innerText = passConfig[state.pass - 1].title;
		}

		// 倒计时变化了
		if (state.timeLeft !== prevState.timeLeft) {
			this.el.querySelector('.time-left').innerText = tools.formatTime(state.timeLeft, 'mm:ss');
		}

		prevState = state;
	});
}

class StateBar extends EventDispatcher {
	constructor(el) {
		super();
		this.el = el;
		render.call(this);
		initStore.call(this);
	}
}

export default StateBar;