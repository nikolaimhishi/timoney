import {Events} from './events.js';
import {Views} from './views.js';

export const Observer = new class {


	/**
	 * @description - A stylesheet that holds all the observables as animations
	 * */

	observatory = document.head.querySelector('[rel=stylesheet]').sheet;


	/**
	 * @description - When an observation occurs we run mutations for each observer
	 * */

	constructor() {

		window.addEventListener('animationstart', async event => Views.mutate(event.target, this.observatory.cssRules[event.animationName.split('crayon--')[1]].action));
	}


	/**
	 * @description - We retrieve all declare modes from manifest, then start observing them
	 * */

	observe(observable, observers) {

		let index = this.observatory.cssRules.length;
		this.observatory.insertRule(`${Events.listen(observable)} {animation: crayon--${index} 1s 0ms forwards;}`, index);
		this.observatory.insertRule(`@keyframes crayon--${index} {}`, index + 1);
		this.observatory.cssRules[index]['action'] = observers
	}
}