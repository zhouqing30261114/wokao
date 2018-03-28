export default {
	/**
	 * 获取关卡棋盘数据
	 * 1、随机选取两个位置，放置类型相同的单元格
	 * 2、从剩余的位置中，执行1
	 * @param {object} passInfo 关卡信息
	 * @return {array} 构建好的棋盘，是一个单元格的数组
	 */
	getItems(passInfo) {
		const items = [];
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
				items.push(leftoverSpace[index]);
				leftoverSpace.splice(index, 1);
			}
			type += 1;
		}
		return items;
	},

	/**
	 * 生成随机颜色
	 * @param {Int} types 单元格种类数目
	 */
	getRandomColors(types) {
		let colors = [], i = 0, count = 0;
		for (i = 0; i < types; i++, count++) {
			let color = Math.random() * 0xffffff << 0;
			// 防止出现过小的色差
			if (colors.some(itemColor => Math.abs(color - itemColor) < 0x08ffff)) {
				i--;
				continue;
			}
			colors.push(color);
		}
		console.log(count - i);
		return colors;
	},

	/**
	 * 计时器
	 * @param {long} timestamp 时间戳 
	 * @param {function} callback 回调 
	 */
	countDown(timestamp, callback) {
		const interval = 200;
		let stopFlag = false;
		const loop = function(s) {
			if (s > 0 && !stopFlag) {
				callback(s);
				setTimeout(function() {
					s -= interval;
					loop(s);
				}, interval);
			}
			if (s <= 0) {
				callback(0);
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
		};
		return rt;
	},

	/**
	 * 格式化时间
	 * @param {long} timeNum 时间戳
	 * @param {string} tmpl 模版 
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

	/**
	 * 当棋盘无解时，换位后可能会有解
	 * @param {array} items 单元格数组
	 */
	getReTypedItemList(items) {
		const rtList = JSON.parse(JSON.stringify(items));
		const typedData = rtList.filter(item => Boolean(item.type));
		const typeList = typedData.map(item => item.type);
		typedData.forEach(item => {
			let typeIndex = Math.floor(Math.random() * typeList.length);
			item.type = typeList[typeIndex];
			typeList.splice(typeIndex, 1);
		});
		return rtList;
	},
};
