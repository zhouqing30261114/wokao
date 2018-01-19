/**
 * 关卡配置
 * size 棋盘尺寸 l/w/h 长宽高，单位为单元格
 * types 单元格种类数
 * timeLeft 倒计时
 */
export default [{
	title: '第一关',
	size: { l: 4, w: 4, h: 4 },
	types: 16,
	timeLeft: 3 * 60e3,
}, {
	title: '第二关',
	size: { l: 5, w: 4, h: 5 },
	types: 20,
	timeLeft: 4 * 60e3,
}, {
	title: '第三关',
	size: { l: 5, w: 6, h: 5 },
	types: 30,
	timeLeft: 5 * 60e3,
}];
