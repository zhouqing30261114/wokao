/**
 * 构建棋盘
 * 1、随机选取两个位置，摆放相同的方块
 * 2、从剩余的位置中，执行1
 */
function createData() {
	const rtData = [];
	let leftoverSpace = [];
	let i = 0, type = 0, index;
	for (let z = 0; z < this.z; z++) {
		for (let y = 0; y < this.y; y++) {
			for (let x = 0; x < this.x; x++) {
				leftoverSpace.push({ id: i++, x: x, y: y, z: z });
			}
		}
	}
	while(leftoverSpace.length > 0) {
		type = type % this.types;
		for (i = 0; i < 2; i++) {
			index = Math.floor(Math.random() * leftoverSpace.length);
			leftoverSpace[index].type = type.toString();
			rtData.push(leftoverSpace[index]);
			leftoverSpace.splice(index, 1);
		}
		type += 1;
	}
	return rtData;
}

/**
 * 获取0折路径
 */
function getPolyline0(a, b) {
	let list = [], i, min, max, area;
	if (a.x === b.x && a.y === b.y && a.z !== b.z) {
		min = a.z > b.z ? b.z : a.z;
		max = a.z > b.z ? a.z : b.z;
		area = this.data.filter((item) => {
			return (item.x === a.x) && (item.y === a.y) && (item.z > min) && (item.z < max);
		});
	} else if (a.x === b.x && a.y !== b.y && a.z === b.z) {
		min = a.y > b.y ? b.y : a.y;
		max = a.y > b.y ? a.y : b.y;
		area = this.data.filter((item) => {
			return (item.x === a.x) && (item.z === a.z) && (item.y > min) && (item.y < max);
		});
	} else if (a.x !== b.x && a.y === b.y && a.z === b.z) {
		min = a.x > b.x ? b.x : a.x;
		max = a.x > b.x ? a.x : b.x;
		area = this.data.filter((item) => {
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
 */
function getPolyline1(a, b) {
	let list = [];
	let m, n; // m/n 为 a/b 的两个对角点
	const a0Obj = {};
	const b0Obj = {};
	if (a.x === b.x && a.y !== b.y && a.z !== b.z) {
		m = this.data.filter(item => item.x === a.x && item.y === b.y && item.z === a.z && !Boolean(item.type))[0];
		n = this.data.filter(item => item.x === a.x && item.y === a.y && item.z === b.z && !Boolean(item.type))[0];
	} else if (a.x !== b.x && a.y === b.y && a.z !== b.z) {
		m = this.data.filter(item => item.y === a.y && item.x === b.x && item.z === a.z && !Boolean(item.type))[0];
		n = this.data.filter(item => item.y === a.y && item.x === a.x && item.z === b.z && !Boolean(item.type))[0];
	} else if (a.x !== b.x && a.y !== b.y && a.z === b.z) {
		m = this.data.filter(item => item.z === a.z && item.x === b.x && item.y === a.y && !Boolean(item.type))[0];
		n = this.data.filter(item => item.z === a.z && item.x === a.x && item.y === b.y && !Boolean(item.type))[0];
	}
	const pList = [m, n]
		.filter(item => Boolean(item))
		.filter((item) => {
			a0Obj[item.id] = getPolyline0.call(this, a, item);
			b0Obj[item.id] = getPolyline0.call(this, b, item);
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
 */
function getPolyline2(a, b) {
	let list = [];
	let m, n, o, p, q, r; // a,b决定的立方体上的六个角，带a,b正好是立方体的8个顶点
	const z0Obj = {};
	const z1Obj = {};
	if (a.x !== b.x && a.y !== b.y && a.z !== b.z) {
		m = this.data.filter(item => item.x === b.x && item.y === a.y && item.z === a.z && !Boolean(item.type))[0];
		n = this.data.filter(item => item.x === b.x && item.y === b.y && item.z === a.z && !Boolean(item.type))[0];
		o = this.data.filter(item => item.x === a.x && item.y === b.y && item.z === a.z && !Boolean(item.type))[0];
		p = this.data.filter(item => item.x === b.x && item.y === a.y && item.z === b.z && !Boolean(item.type))[0];
		q = this.data.filter(item => item.x === a.x && item.y === a.y && item.z === b.z && !Boolean(item.type))[0];
		r = this.data.filter(item => item.x === a.x && item.y === b.y && item.z === b.z && !Boolean(item.type))[0];
		const pList = [m, n, o, p, q, r]
			.filter(item => Boolean(item))
			.filter((item) => {
				z0Obj[item.id] = getPolyline0.call(this, a, item);
				return z0Obj[item.id].length > 0;
			})
			.filter((item) => {
				z1Obj[item.id] = getPolyline1.call(this, b, item);
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
 * 调整顺序
 * @param {*} list 
 * @param {*} p
 * @param {*} dir 
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
 * 数据模型类
 */
class Model {
	constructor(p = { x: 3, y: 3, z: 3, types: 5 }) {
		this.x = p.x;
		this.y = p.y;
		this.z = p.z;
		this.types = p.types;
		this.data = createData.call(this);
	};
	/**
	 * 获取连通路径
	 * @param {Object} a 节点
	 * @param {Object} b 节点
	 */
	getLinkPath(a, b) {
		let list;
		if (a.id === b.id || !a.type || !b.type || (a.type !== b.type)) {
			list = [];
		} else {
			list = getPolyline0.call(this, a, b);
			if (list.length === 0) {
				list = getPolyline1.call(this, a, b);
				if (list.length === 0) {
					list = getPolyline2.call(this, a, b);	
				}	
			}
		}
		return list;
	};
	/**
	 * 当棋盘无解时，换位后可能会有解
	 */
	reOrderData() {
		const typedData = this.data.filter(item => Boolean(item.type));
		const typeList = typedData.map(item => item.type);
		typedData.forEach(item => {
			let typeIndex = Math.floor(Math.random() * typeList.length);
			item.type = typeList[typeIndex];
			typeList.splice(typeIndex, 1);
		});
	};
};

export default Model;