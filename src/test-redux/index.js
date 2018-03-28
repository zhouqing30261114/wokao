import { combineReducers, createStore } from 'redux'

export default () => {

	let todoState = {
		todos: [{
			text: 'Eat food',
			completed: true
		}, {
			text: 'Exercise',
			completed: false
		}],
		visibilityFilter: 'SHOW_COMPLETED'
	};

	function visibilityFilter(state = 'SHOW_ALL', action) {
		if (action.type === 'SET_VISIBILITY_FILTER') {
			return action.filter;
		} else {
			return state;
		}
	}
	
	function todos(state = [], action) {
		switch (action.type) {
		case 'ADD_TODO':
			return state.concat([{ text: action.text, completed: false }]);
		case 'TOGGLE_TODO':
			return state.map((todo, index) =>
				action.index === index ?
					{ text: todo.text, completed: !todo.completed } :
					todo
		 )
		default:
			return state;
		}
	}

	function todoApp(state = {}, action) {
		return {
			todos: todos(state.todos, action),
			visibilityFilter: visibilityFilter(state.visibilityFilter, action)
		};
	}

	// todoState = todoApp(todoState, {
	// 	type: 'ADD_TODO',
	// 	text: 'xxx',
	// });

	// let reducer = combineReducers({ visibilityFilter, todos })
	let store = createStore(todoApp, todoState);

	console.log(store.getState());

	store.dispatch({
		type: 'ADD_TODO',
		text: 'yyy',
	})

	console.log(store.getState());

}