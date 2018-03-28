import welcomeTempl from './welcome.ejs';
import gameoverTempl from './gameover.ejs';
import gameTempl from './game.ejs';

export default {
	renderWelcomePage() {
		document.body.innerHTML = welcomeTempl();
	},
	renderGameOverPage() {
		document.body.innerHTML = gameoverTempl();
	},
	renderGamePage() {
		document.body.innerHTML = gameTempl();
	},
};
