import { createStore, combineReducers } from 'redux';

// const initState = {
//  passInfo: {}, // 关卡信息
// 	itemList: [], // 单元格列表
//  linkedItems: [], // 连通路径
//  timeLeft: 0, // 倒计时
// };

function passInfo(state = {}, action) {
	switch (action.type) {
		case 'UPDATE_PASS_INFO':
			// return {
			// 	...state,
			// 	...action.value,
			// };
			return action.value || {};
		default:
			return state;
	}
}

function itemList(state = [], action) {
	switch (action.type) {
		case 'ADD_ITEM':
			return [
				...state,
				action.value
			];
		case 'UPDATE_ITEM_LIST':
			return action.value || [];
		case 'UPDATE_ITEM_TYPE':
			return state.map((item) => {
				if (item.id === action.id) {
					return {
						...item,
						type: action.value,
					}
				}
				return item;
			});
		case 'UPDATE_ITEM_CHECKED':
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
	switch (action.type) {
		case 'UPDATE_LINKED_ITEMS':
			return action.value || [];
		case 'CLEAR_LINKED_ITEMS':
			return [];
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

const app = combineReducers({ passInfo, itemList, linkedItems, timeLeft });
const store = createStore(app);

export default store;