import { EventDispatcher } from 'three';
import templ from './index.ejs';

function render() {
	this.el.innerHTML = templ();
}

function event() {
	const resetBtn = this.el.querySelector('.reset-btn');
	resetBtn.addEventListener('click', () => {
		this.dispatchEvent({
			type: 'reset-items',
		});
	}, false);
}

class ControlBar extends EventDispatcher {
	constructor(el) {
		super();
		this.el = el;
		render.call(this);
		event.call(this);
	}
}

export default ControlBar;