import store from './store';
import actions from './actions';
import WelcomePage from './welcome/index';
import GamePage from './game/index';
import GameOverPage from './game-over/index';
import CongratulatePage from './congratulate/index';

const WELCOME_PAGE = 'welcome';
const GAME_PAGE = 'game';
const GAME_OVER_PAGE = 'gameover';
const CONGRATULATE_PAGE = 'congratulate';

// store的每次dispach都会触发subscribe监听函数，使用lock是为了方便执行一系列dispach后再触发subscribe
// 先在subscribe函数开头写上 if(lock) { return }
// 然后将需要组合的dispach放到 lock = true 和 lock = false 之间
window.lock = false;

let prevState = store.getState();

function startGame() {
	store.dispatch({
		type: actions.UPDATE_PASS,
		value: 0,
	});
	store.dispatch({
		type: actions.UPDATE_PAGE,
		value: GAME_PAGE,
	});
}

function replay() {
	store.dispatch({
		type: actions.UPDATE_PASS,
		value: prevState.pass - 1,
	});
	store.dispatch({
		type: actions.UPDATE_PAGE,
		value: GAME_PAGE,
	});
}

function gameOver() {
	this.clearStoreSubscribe();
	store.dispatch({
		type: actions.UPDATE_PAGE,
		value: GAME_OVER_PAGE,
	});
}

function congratulate() {
	this.clearStoreSubscribe();
	store.dispatch({
		type: actions.UPDATE_PAGE,
		value: CONGRATULATE_PAGE,
	});
}

function createPage(page) {
	let curPage;
	switch(page) {
		case WELCOME_PAGE:
			curPage = new WelcomePage(document.body);
			curPage.addEventListener('start-game', startGame);
			return curPage;
		case GAME_PAGE:
			curPage = new GamePage(document.body);
			curPage.addEventListener('game-over', gameOver);
			curPage.addEventListener('congratulate', congratulate);
			return curPage;
		case GAME_OVER_PAGE:
			curPage = new GameOverPage(document.body);
			curPage.addEventListener('start-game', startGame);
			curPage.addEventListener('replay', replay);
			return curPage;
		case CONGRATULATE_PAGE:
			curPage = new CongratulatePage(document.body);
			curPage.addEventListener('start-game', startGame);
			return curPage;
		default:
			return null;
	}
}

export default () => {

	store.subscribe(function() {
		const state = store.getState();

		// 监听page变化
		if (state.page !== prevState.page) {
			prevState = state;
			createPage(state.page);
		}

	});

	store.dispatch({
		type: actions.UPDATE_PAGE,
		value: WELCOME_PAGE,
	});

};
