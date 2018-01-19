export default {
	/**
	 * 加载单个图像
	 * @param {String} imgUrl
	 * @returns {Promise}
	 */
	loadImage(imgUrl) {
		return new Promise((resolve) => {
			const image = new Image();
			image.src = imgUrl;
			image.onload = () => {
				resolve(image);
			};
		});
	},
	/**
	 * 加载图像列表
	 * @param {Array} imgUrlList
	 * @returns {Promise}
	 */
	loadImageList(imgUrlList) {
		const loadImgPromiseList = imgUrlList.map(imgUrl => this.loadImage(imgUrl));
		return Promise.all(loadImgPromiseList);
	},
};
