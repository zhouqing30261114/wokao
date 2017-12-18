import { Router } from 'director/build/director.min.js';

const routes = {
	'/:dirName': (dirName) => {
		import(`./${dirName}`).then((obj) => {
			if (typeof obj.default === 'function') {
				obj.default();
			}
		});
	},
};
const router = Router(routes);
router.init();