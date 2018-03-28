import { EventDispatcher } from 'three';
import templ from './index.ejs';

function render() {
	this.el.innerHTML = templ();
}

function event() {
	const startGameBtn = this.el.querySelector('.start-game-btn');

	startGameBtn.addEventListener('click', () => {
		this.dispatchEvent({
			type: 'start-game',
		})
	}, false);
}

class Congratulate extends EventDispatcher {
	constructor(el) {
		super();
		this.el = el;
		render.call(this);
		event.call(this);
	}
}

export default Congratulate;
