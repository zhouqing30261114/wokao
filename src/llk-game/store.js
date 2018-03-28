/**
 * 数据仓库
 * page 页面索引 welcome/game/gameover/success
 * pass 关卡索引，1/2/...
 * items 单元格列表
 * linkedItems 连通路径（单元格数组）
 * timeLeft 倒计时
 */
import { createStore, combineReducers } from 'redux';
import act from './actions';

function page(state = '', action) {
	switch(action.type) {
		case act.UPDATE_PAGE:
			return action.value || '';
		default:
			return state;
	}
}

function pass(state = 0, action) {
	switch(action.type) {
		case act.UPDATE_PASS:
			return action.value || 0;
		default:
			return state;
	}
}

function items(state = [], action) {
	switch(action.type) {
		case act.ADD_ITEM:
			return [
				...state,
				action.value || {},
			];
		case act.UPDATE_ITEMS:
			return action.value || [];
		case act.UPDATE_ITEM_TYPE:
			return state.map((item) => {
				if (item.id === action.id) {
					return {
						...item,
						type: action.value,
					}
				}
				return item;
			});
		case act.UPDATE_ITEM_CHECKED:
			return state.map((item) => {
				if (item.id === action.id) {
					return {
						...item,
						checked: action.value,
					}
				}
				return item;
			});
		default:
			return state;
	}
}

function linkedItems(state = [], action) {
	switch(action.type) {
		case act.UPDATE_LINKED_ITEMS:
			return action.value || [];
		default:
			return state;
	}
}

function timeLeft(state = 0, action) {
	switch (action.type) {
		case act.UPDATE_TIME_LEFT:
			return action.value || 0;
		default:
			return state;
	}
}

const app = combineReducers({ page, pass, items, linkedItems, timeLeft });
const store = createStore(app);

export default store;
