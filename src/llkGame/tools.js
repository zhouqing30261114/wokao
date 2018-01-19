export default {
	/**
	 * 构建棋盘
	 * 1、随机选取两个位置，放置类型相同的单元格
	 * 2、从剩余的位置中，执行1
	 * @param {object} passInfo 关卡信息
	 * @return {array} 构建好的棋盘，是一个单元格的数组
	 */
	createItemList(passInfo) {
		const rtData = [];
		let leftoverSpace = [];
		let i = 0, type = 0, index;
		for (let z = 0; z < passInfo.size.h; z++) {
			for (let y = 0; y < passInfo.size.w; y++) {
				for (let x = 0; x < passInfo.size.l; x++) {
					leftoverSpace.push({ id: i++, x: x, y: y, z: z });
				}
			}
		}
		while(leftoverSpace.length > 0) {
			type = type % passInfo.types;
			for (i = 0; i < 2; i++) {
				index = Math.floor(Math.random() * leftoverSpace.length);
				leftoverSpace[index].type = type.toString();
				rtData.push(leftoverSpace[index]);
				leftoverSpace.splice(index, 1);
			}
			type += 1;
		}
		return rtData;
	},

	/**
	 * 获取0折路径
	 * @param {object} a 单元格 
	 * @param {object} b 单元格
	 * @param {array} itemList 单元格数组
	 */
	getPolyline0(a, b, itemList) {
		let list = [], i, min, max, area;
		if (a.x === b.x && a.y === b.y && a.z !== b.z) {
			min = a.z > b.z ? b.z : a.z;
			max = a.z > b.z ? a.z : b.z;
			area = itemList.filter((item) => {
				return (item.x === a.x) && (item.y === a.y) && (item.z > min) && (item.z < max);
			});
		} else if (a.x === b.x && a.y !== b.y && a.z === b.z) {
			min = a.y > b.y ? b.y : a.y;
			max = a.y > b.y ? a.y : b.y;
			area = itemList.filter((item) => {
				return (item.x === a.x) && (item.z === a.z) && (item.y > min) && (item.y < max);
			});
		} else if (a.x !== b.x && a.y === b.y && a.z === b.z) {
			min = a.x > b.x ? b.x : a.x;
			max = a.x > b.x ? a.x : b.x;
			area = itemList.filter((item) => {
				return (item.y === a.y) && (item.z === a.z) && (item.x > min) && (item.x < max);
			});
		}
		if (Boolean(area)) {
			list = (area.filter(item => Boolean(item.type)).length === 0) ? [a].concat(area, [b]) : [];
		}
		return list;
	},

	/**
	 * 获取1折路径
	 * @param {object} a 单元格 
	 * @param {object} b 单元格
	 * @param {array} itemList 单元格数组
	 */
	getPolyline1(a, b, itemList) {
		let list = [];
		let m, n; // m/n 为 a/b 的两个对角点
		const a0Obj = {};
		const b0Obj = {};
		if (a.x === b.x && a.y !== b.y && a.z !== b.z) {
			m = itemList.filter(item => item.x === a.x && item.y === b.y && item.z === a.z && !Boolean(item.type))[0];
			n = itemList.filter(item => item.x === a.x && item.y === a.y && item.z === b.z && !Boolean(item.type))[0];
		} else if (a.x !== b.x && a.y === b.y && a.z !== b.z) {
			m = itemList.filter(item => item.y === a.y && item.x === b.x && item.z === a.z && !Boolean(item.type))[0];
			n = itemList.filter(item => item.y === a.y && item.x === a.x && item.z === b.z && !Boolean(item.type))[0];
		} else if (a.x !== b.x && a.y !== b.y && a.z === b.z) {
			m = itemList.filter(item => item.z === a.z && item.x === b.x && item.y === a.y && !Boolean(item.type))[0];
			n = itemList.filter(item => item.z === a.z && item.x === a.x && item.y === b.y && !Boolean(item.type))[0];
		}
		const pList = [m, n]
			.filter(item => Boolean(item))
			.filter((item) => {
				a0Obj[item.id] = this.getPolyline0(a, item, itemList);
				b0Obj[item.id] = this.getPolyline0(b, item, itemList);
				return a0Obj[item.id].length > 0 && b0Obj[item.id].length > 0;
			});
		if (pList.length) {
			const p = pList[0];
			const apList = this.adjustOrder(a0Obj[p.id].filter(item => item.id !== p.id), p, 'last');
			const bpList = this.adjustOrder(b0Obj[p.id].filter(item => item.id !== p.id), p, 'first');
			list = [].concat(apList, [p], bpList);
		}
		return list;
	},

	/**
	 * 获取2折路径
	 * @param {object} a 单元格 
	 * @param {object} b 单元格
	 * @param {array} itemList 单元格数组
	 */
	getPolyline2(a, b, itemList) {
		let list = [];
		let m, n, o, p, q, r; // a,b决定的立方体上的六个角，带a,b正好是立方体的8个顶点
		const z0Obj = {};
		const z1Obj = {};
		if (a.x !== b.x && a.y !== b.y && a.z !== b.z) {
			m = itemList.filter(item => item.x === b.x && item.y === a.y && item.z === a.z && !Boolean(item.type))[0];
			n = itemList.filter(item => item.x === b.x && item.y === b.y && item.z === a.z && !Boolean(item.type))[0];
			o = itemList.filter(item => item.x === a.x && item.y === b.y && item.z === a.z && !Boolean(item.type))[0];
			p = itemList.filter(item => item.x === b.x && item.y === a.y && item.z === b.z && !Boolean(item.type))[0];
			q = itemList.filter(item => item.x === a.x && item.y === a.y && item.z === b.z && !Boolean(item.type))[0];
			r = itemList.filter(item => item.x === a.x && item.y === b.y && item.z === b.z && !Boolean(item.type))[0];
			const pList = [m, n, o, p, q, r]
				.filter(item => Boolean(item))
				.filter((item) => {
					z0Obj[item.id] = this.getPolyline0(a, item, itemList);
					return z0Obj[item.id].length > 0;
				})
				.filter((item) => {
					z1Obj[item.id] = this.getPolyline1(b, item, itemList);
					return z1Obj[item.id].length > 0;
				});
			if (pList.length) {
				const p = pList[0];
				const z0List = this.adjustOrder(z0Obj[p.id].filter(item => item.id !== p.id), p, 'last');
				const z1List = this.adjustOrder(z1Obj[p.id].filter(item => item.id !== p.id), p, 'first');
				list = [].concat(z0List, [p], z1List);
			}
		}
		return list;
	},

	/**
	 * 调整顺序
	 * @param {array} list 单元格数组
	 * @param {*} p
	 * @param {*} dir 
	 */
	adjustOrder(list, p, dir) {
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
	},

	/**
	 * 获取连通路径
	 * @param {Object} a 单元格
	 * @param {Object} b 单元格
	 * @param {array} itemList 单元格数组
	 */
	getLinkPath(a, b, itemList) {
		let list;
		if (a.id === b.id || !a.type || !b.type || (a.type !== b.type)) {
			list = [];
		} else {
			list = this.getPolyline0(a, b, itemList);
			if (list.length === 0) {
				list = this.getPolyline1(a, b, itemList);
				if (list.length === 0) {
					list = this.getPolyline2(a, b, itemList);
				}	
			}
		}
		return list;
	},

	/**
	 * 生成随机颜色
	 * @param {Int} types 单元格种类数目
	 */
	getRandomColors(types) {
		let colors = [];
		for (let i = 0; i < types; i++) {
			colors.push(Math.random() * 0xffffff << 0);
		}
		return colors;
	},

	/**
	 * 当棋盘无解时，换位后可能会有解
	 * @param {array} itemList 单元格数组
	 */
	getReTypedItemList(itemList) {
		const rtList = JSON.parse(JSON.stringify(itemList));
		const typedData = rtList.filter(item => Boolean(item.type));
		const typeList = typedData.map(item => item.type);
		typedData.forEach(item => {
			let typeIndex = Math.floor(Math.random() * typeList.length);
			item.type = typeList[typeIndex];
			typeList.splice(typeIndex, 1);
		});
		return rtList;
	},

	/**
	 * 倒计时
	 */
	countDown(timestamp, callback) {
		const interval = 200;
		const loop = function(s) {
			if (s > 0) {
				callback(s);
				setTimeout(function() {
					s -= interval;
					loop(s);
				}, interval);
			} else {
				callback(0);
			}
		};
		loop(timestamp);
	},

	countDown2(timestamp, callback) {
		const interval = 200;
		let stopFlag = false;
		const loop = function(s) {
			if (s > 0 && !stopFlag) {
				callback(s);
				setTimeout(function() {
					s -= interval;
					loop(s);
				}, interval);
			} else {
				if (s < 0) {
					s = 0;
				}
				callback(s);
			}
		};
		let rt = {
			start() {
				stopFlag = false;
				loop(timestamp);
			},
			stop() {
				stopFlag = true;
			},
			clear() {
				rt = null;
			}
		};
		return rt;
	},

	/**
	 * 格式化时间
	 */
	formatTime(timeNum, tmpl) {
		//转化为数字
		const num = /^\-?\d+$/i.test(timeNum + "") ? +timeNum : Date.parse(timeNum);
		//如果数据不能转化为日期，则直接返回不处理
		if (isNaN(num)){
			return timeNum;
		}
		//转化日期
		const D = new Date(num),
			zz = function(a) {
				return ("0" + a).slice(-2);
			},
			yyyy = D.getFullYear(),
			M = D.getMonth() + 1,
			MM = zz(M),
			d = D.getDate(),
			dd = zz(d),
			h = D.getHours(),
			hh = zz(h),
			m = D.getMinutes(),
			mm = zz(m),
			s = D.getSeconds(),
			ss = zz(s);
		return (tmpl || "yyyy-MM-dd hh:mm:ss")
			.replace(/yyyy/g, yyyy)
			.replace(/MM/g, MM).replace(/M/g, M)
			.replace(/dd/g, dd).replace(/d/g, d)
			.replace(/hh/g, hh).replace(/h/g, h)
			.replace(/mm/g, mm).replace(/m/g, m)
			.replace(/ss/g, ss).replace(/s/g, s);
	},
};
