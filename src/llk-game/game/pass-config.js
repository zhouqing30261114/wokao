/**
 * 关卡配置
 * title 标题
 * size 棋盘尺寸 l/w/h 长宽高，单位为单元格
 * types 单元格种类数
 * timeLeft 倒计时
 */
export default [
	{
		title: '第一关',
		size: { l: 2, w: 2, h: 2 },
		types: 3,
		timeLeft: 1 * 60e3,
	},
	{
		title: '第二关',
		size: { l: 4, w: 4, h: 4 },
		types: 16,
		timeLeft: 3 * 60e3,
	},
	{
		title: '第三关',
		size: { l: 4, w: 4, h: 4 },
		types: 16,
		timeLeft: 2 * 60e3,
	}
];
