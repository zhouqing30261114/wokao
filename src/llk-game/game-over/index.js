import { EventDispatcher } from 'three';
import templ from './index.ejs';

function render() {
	this.el.innerHTML = templ();
}

function event() {
	const startGameBtn = this.el.querySelector('.start-game-btn');
	const replayBtn = this.el.querySelector('.replay-btn');

	startGameBtn.addEventListener('click', () => {
		this.dispatchEvent({
			type: 'start-game',
		})
	}, false);

	replayBtn.addEventListener('click', () => {
		this.dispatchEvent({
			type: 'replay',
		})
	}, false);
}

class GameOver extends EventDispatcher {
	constructor(el) {
		super();
		this.el = el;
		render.call(this);
		event.call(this);
	}
}

export default GameOver;
