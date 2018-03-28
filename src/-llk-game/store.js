/**
 * 数据仓库
 * pass 关卡索引，welcome/1/2/.../gameover
 * checkedItemIds 选中单元格id的数组，长度小于等于2
 * linkedItemIds 连通路径（单元格id的数组）
 * timeLeft 倒计时
 */
import { createStore, combineReducers } from 'redux';

function pass(state = 'welcome', action) {
	switch(action.type) {
		case 'UPDATE_PASS':
			return action.value || 'welcome';
		default:
			return state;
	}
}

function checkedItemIds(state = [], action) {
	switch(action.type) {
		case 'ADD_CHECKED_ITEM':
			if (state.length >= 2) {
				return state;
			}
			return [
				...state,
				action.value
			];
		default:
			return state;
	}
}

function linkedItemIds(state = [], action) {
	switch(action.type) {
		case 'UPDATE_LINKED_ITEMS':
			return action.value || [];
		default:
			return state;
	}
}

function timeLeft(state = 0, action) {
	switch (action.type) {
		case 'UPDATE_TIME_LEFT':
			return action.value || 0;
		default:
			return state;
	}
}

const app = combineReducers({ pass, checkedItemIds, linkedItemIds, timeLeft });
const store = createStore(app);

export default store;
