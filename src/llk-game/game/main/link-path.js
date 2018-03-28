/**
 * 调整顺序
 * @param {array} list 单元格数组
 * @param {*} p
 * @param {*} dir 
 * @return {array} 单元格数组
 */
function adjustOrder(list, p, dir) {
	const indexMap = {
		'last': list.length - 1,
		'first': 0,
	};
	const joinP = list[indexMap[dir]];
	const isJoined = (joinP.x === p.x && joinP.y === p.y && joinP.z !== p.z) || 
		(joinP.x === p.x && joinP.y !== p.y && joinP.z === p.z) ||
		(joinP.x !== p.x && joinP.y === p.y && joinP.z === p.z)
	// 判断是否连着的
	if (!isJoined) {
		list.reverse();
	}
	return list;
}

/**
 * 获取0折路径
 * @param {object} a 单元格 
 * @param {object} b 单元格
 * @param {array} items 单元格数组
 * @return {array} 单元格数组
 */
function getPolyline0(a, b, items) {
	let list = [], i, min, max, area;
	if (a.x === b.x && a.y === b.y && a.z !== b.z) {
		min = a.z > b.z ? b.z : a.z;
		max = a.z > b.z ? a.z : b.z;
		area = items.filter((item) => {
			return (item.x === a.x) && (item.y === a.y) && (item.z > min) && (item.z < max);
		});
	} else if (a.x === b.x && a.y !== b.y && a.z === b.z) {
		min = a.y > b.y ? b.y : a.y;
		max = a.y > b.y ? a.y : b.y;
		area = items.filter((item) => {
			return (item.x === a.x) && (item.z === a.z) && (item.y > min) && (item.y < max);
		});
	} else if (a.x !== b.x && a.y === b.y && a.z === b.z) {
		min = a.x > b.x ? b.x : a.x;
		max = a.x > b.x ? a.x : b.x;
		area = items.filter((item) => {
			return (item.y === a.y) && (item.z === a.z) && (item.x > min) && (item.x < max);
		});
	}
	if (Boolean(area)) {
		list = (area.filter(item => Boolean(item.type)).length === 0) ? [a].concat(area, [b]) : [];
	}
	return list;
}

/**
 * 获取1折路径
 * @param {object} a 单元格 
 * @param {object} b 单元格
 * @param {array} items 单元格数组
 * @return {array} 单元格数组
 */
function getPolyline1(a, b, items) {
	let list = [];
	let m, n; // m/n 为 a/b 的两个对角点
	const a0Obj = {};
	const b0Obj = {};
	if (a.x === b.x && a.y !== b.y && a.z !== b.z) {
		m = items.filter(item => item.x === a.x && item.y === b.y && item.z === a.z && !Boolean(item.type))[0];
		n = items.filter(item => item.x === a.x && item.y === a.y && item.z === b.z && !Boolean(item.type))[0];
	} else if (a.x !== b.x && a.y === b.y && a.z !== b.z) {
		m = items.filter(item => item.y === a.y && item.x === b.x && item.z === a.z && !Boolean(item.type))[0];
		n = items.filter(item => item.y === a.y && item.x === a.x && item.z === b.z && !Boolean(item.type))[0];
	} else if (a.x !== b.x && a.y !== b.y && a.z === b.z) {
		m = items.filter(item => item.z === a.z && item.x === b.x && item.y === a.y && !Boolean(item.type))[0];
		n = items.filter(item => item.z === a.z && item.x === a.x && item.y === b.y && !Boolean(item.type))[0];
	}
	const pList = [m, n]
		.filter(item => Boolean(item))
		.filter((item) => {
			a0Obj[item.id] = getPolyline0(a, item, items);
			b0Obj[item.id] = getPolyline0(b, item, items);
			return a0Obj[item.id].length > 0 && b0Obj[item.id].length > 0;
		});
	if (pList.length) {
		const p = pList[0];
		const apList = adjustOrder(a0Obj[p.id].filter(item => item.id !== p.id), p, 'last');
		const bpList = adjustOrder(b0Obj[p.id].filter(item => item.id !== p.id), p, 'first');
		list = [].concat(apList, [p], bpList);
	}
	return list;
}

/**
 * 获取2折路径
 * @param {object} a 单元格 
 * @param {object} b 单元格
 * @param {array} items 单元格数组
 * @return {array} 单元格数组
 */
function getPolyline2(a, b, items) {
	let list = [];
	let m, n, o, p, q, r; // a,b决定的立方体上的六个角，带a,b正好是立方体的8个顶点
	const z0Obj = {};
	const z1Obj = {};
	if (a.x !== b.x && a.y !== b.y && a.z !== b.z) {
		m = items.filter(item => item.x === b.x && item.y === a.y && item.z === a.z && !Boolean(item.type))[0];
		n = items.filter(item => item.x === b.x && item.y === b.y && item.z === a.z && !Boolean(item.type))[0];
		o = items.filter(item => item.x === a.x && item.y === b.y && item.z === a.z && !Boolean(item.type))[0];
		p = items.filter(item => item.x === b.x && item.y === a.y && item.z === b.z && !Boolean(item.type))[0];
		q = items.filter(item => item.x === a.x && item.y === a.y && item.z === b.z && !Boolean(item.type))[0];
		r = items.filter(item => item.x === a.x && item.y === b.y && item.z === b.z && !Boolean(item.type))[0];
		const pList = [m, n, o, p, q, r]
			.filter(item => Boolean(item))
			.filter((item) => {
				z0Obj[item.id] = getPolyline0(a, item, items);
				return z0Obj[item.id].length > 0;
			})
			.filter((item) => {
				z1Obj[item.id] = getPolyline1(b, item, items);
				return z1Obj[item.id].length > 0;
			});
		if (pList.length) {
			const p = pList[0];
			const z0List = adjustOrder(z0Obj[p.id].filter(item => item.id !== p.id), p, 'last');
			const z1List = adjustOrder(z1Obj[p.id].filter(item => item.id !== p.id), p, 'first');
			list = [].concat(z0List, [p], z1List);
		}
	}
	return list;
}

/**
 * 获取3D连连看两个单元格的连通路径
 * @param {object} a 单元格 
 * @param {object} b 单元格
 * @param {array} items 单元格数组
 * @return {array} 单元格数组
 */
export default function(a, b, items) {
	let list;
	if (a.id === b.id || !a.type || !b.type || (a.type !== b.type)) {
		list = [];
	} else {
		list = getPolyline0(a, b, items);
		if (list.length === 0) {
			list = getPolyline1(a, b, items);
			if (list.length === 0) {
				list = getPolyline2(a, b, items);
			}	
		}
	}
	return list;
};
