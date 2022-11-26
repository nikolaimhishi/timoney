import {Hogan} from '../services/crayon/addon/hogan-3.0.2.mustache.min.js';
import {Events} from '../services/crayon/modules/events.js';
import {Views} from '../services/crayon/modules/views.js';
import {Network} from '../services/crayon/modules/network.js';
import {Models} from '../services/crayon/modules/models.js';
import {Observer} from '../services/crayon/modules/observer.js';


/**
 * @description - Fetch all app views then compile them as render ready layouts
 * */

new class {


	constructor() {


		/**@views*/

		this.fetch(document.querySelectorAll(`head [rel='component']`))
			.then(this.compile).then(this.launch);
	}


	/**
	 * @description - Fetch declared app views
	 * */

	async fetch(declared) {


		let names = [];
		let views = [];


		/**@components*/

		for (let declaration of declared) {


			/**@names*/

			let name = declaration.href.split('/').pop();
			names.push(name);


			/**@views*/

			views.push(fetch(declaration.attributes.href.value, {cache: 'default'}).then(response => response.text()));
		}


		/**@fetched*/

		return {views, names};
	}


	/**
	 * @description - Compile fetched views as render ready layouts
	 * */

	async compile(fetched) {


		const {views, names} = fetched;


		/**@fetched*/

		window.components = {};
		let files = await Promise.all(views);


		/**@hogan*/

		let i = -1;
		while (++i < views.length) window.components[names[i]] = Hogan.compile(files[i]);
	}


	/**
	 * @description - Find all intents and launch them in order of declaration
	 * */

	launch() {


		/**@intents*/

		for (const intent of document.querySelectorAll(`a[rel=intent]`)) intent.click();
	}
};