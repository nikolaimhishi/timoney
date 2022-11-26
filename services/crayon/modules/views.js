import {Models} from './models.js';


/**
 * @description - After transacting data from the sources above we are to render it here
 * */

export const Views = new class {


	content;
	rewinding;
	cacheable;

	constructor() {

		window.backstack = [];
	}

	mutate(target, mutations) {

		for (let selector of Object.keys(mutations))
			for (let target of document.querySelectorAll(selector))
				for (let mutation of mutations[selector]) this[mutation](mutations[selector][mutation]);
	}


	/**
	 * @description - Create element from layout template, and add to beginning of list
	 * @cacheable - create
	 * */

	async prepend(target, layout, mode = 'prepend') {


		/**@UI*/

		for (let data of [].concat(this.content || {})) {


			/**@exists*/

			let exists = target.querySelector(`:scope > [data-object='${data['_id']}']`);
			if (exists) exists.parentElement[mode](exists);


			/**@create*/

			else target.insertAdjacentHTML(mode === 'prepend' ? 'afterbegin' : 'beforeend', window.components[layout].render(data, window.components));
		}


		/**@DB*/

		if (this.cacheable) {


			/**@List*/

			let element = target.closest('[data-object]');
			if (!element) return;


			/**@Adapter*/

			let id = element.getAttribute('[data-object]');
			let path = (target.getAttribute('[data-list]') || '').split('.');


			/**@Save*/

			for (let data of [].concat(this.content || {}))
				await Models.put(id, path, data, mode);
		}
	}


	/**
	 * @description - Create element from layout template, and add to end of list
	 * @cacheable - create
	 * */

	async append(target, layout) {

		await this.prepend.call(this, target, layout, 'append');
	}


	/**
	 * @description - Moves the target to first sibling
	 * @cacheable - yes
	 * */

	async first(target, mode = 'first') {


		/**@UI*/

		if (mode.match(/first/)) target.parentElement.prepend(target);
		else target.parentElement.append(target);


		/**@DB*/

		if (this.cacheable && target.dataset.object) {


			/**@List*/

			let element = target.closest('[data-list]');
			if (!element) return;


			/**@Object*/

			let object = element.closest('[data-object]');
			if (!object) return;


			/**@Save*/

			await Models.put(object.dataset.object, (element.dataset.list || '').split('.'), {_id: target.dataset.object}, 'first');
		}
	}


	/**
	 * @description - Moves the target to last sibling
	 * @cacheable - yes
	 * */

	async last(target) {

		await this.first.call(this, target, 'last');
	}


	/**
	 * @description - Overwrites the data in current element with incoming
	 * @cacheable - yes
	 * */

	async replace() {

		await this.merge.call(this, true);
	}


	/**
	 * @description - Update all elements matched by model
	 * @cacheable - yes
	 * */

	async merge(replace) {


		/**@DB*/

		if (this.cacheable) return Models.patch(this.content, replace);


		/**@UI*/

		for (let data of [].concat(this.content || {}))
			for (let object of document.querySelectorAll(`[data-object='${data['_id']}']`))
				for (let key of object.querySelectorAll('[data-key]'))
					if (key.closest('[data-object]') === object)
						inline(key, key.dataset.key, data);


		/**@Helper*/

		function inline(element, key, value) {


			/**@blob*/

			if (value instanceof Blob) {
				element.src = URL.createObjectURL(value);
				return;
			}


			/**@object*/

			if (typeof value === 'object') {
				let steps = key.split('.').slice(1);
				for (let key of steps) if (value) value = value[key]; else break;
			}


			/**@null*/

			if (value === null) {
				element.remove();
				return;
			}


			/**@true*/

			if (value === true) {
				element.setAttribute(key.split('.').pop(), 'true');
				return;
			}


			/**@false*/

			if (value === false) {
				element.removeAttribute(key.split('.').pop());
				return;
			}


			/**@input*/

			if (element.nodeName === 'INPUT') {
				element.setAttribute('value', value);
				return;
			}


			/**@text*/

			element.textContent = value;
		}
	}


	/**
	 * @description - Remove all target element including blobs
	 * @cacheable - yes
	 * */

	async remove(target) {


		/**@DB*/

		if (this.cacheable && target.dataset.object)
			target = Models.delete(target.dataset.object);


		/**@UI*/

		for (let element of target instanceof HTMLElement ? [target] : document.querySelectorAll(target)) {


			/**@task*/

			if (element.hasAttribute('crayon-task')) return this.finish(element);


			/**@blobs*/

			for (let el of element.querySelectorAll(`[src*='blob:http']`))
				if (document.querySelectorAll(`[src='${el.src}']`).length === 1) URL.revokeObjectURL(el.src);


			/**@element*/

			element.remove();
		}
	}


	/**
	 * @description - Sets the state attribute on target
	 * @cacheable - meta
	 * */

	async setAttribute(target, state) {


		/**@DB*/

		if (this.cacheable && target.dataset.object)
			target = Models.transition(target.dataset.object, 'set', state);


		/**@UI*/

		for (let element of target instanceof HTMLElement ? [target] : document.querySelectorAll(target))
			element.setAttribute(state, '');
	}


	/**
	 * @description - Remove the state attribute on target
	 * @cacheable - meta
	 * */

	async removeAttribute(target, state) {


		/**@DB*/

		if (this.cacheable && target.dataset.object)
			target = Models.transition(target.dataset.object, 'remove', state);


		/**@UI*/

		for (let element of target instanceof HTMLElement ? [target] : document.querySelectorAll(target))
			element.removeAttribute(state);
	}


	/**
	 * @description - Toggle the state attribute on target
	 * @cacheable - meta
	 * */

	async toggleAttribute(target, state) {


		/**@DB*/

		if (this.cacheable && target.dataset.object)
			target = Models.transition(target.dataset.object, 'toggle', state);


		/**@UI*/

		for (let element of target instanceof HTMLElement ? [target] : document.querySelectorAll(target))
			element.toggleAttribute(state);
	}


	/**
	 * @description - Removes state from anyone else who has it and sets it here
	 * @cacheable - meta
	 * */

	async radioAttribute(target, state) {


		/**@DB*/

		if (this.cacheable && target.dataset.object)
			target = Models.transition(target.dataset.object, 'radio', state);


		/**@UI*/

		for (let element of target instanceof HTMLElement ? [target] : document.querySelectorAll(`[${state}]`))
			element.removeAttribute(state);
		target.setAttribute(state, '');
	}


	/**
	 * @description - Filters items against the content object
	 * @cacheable - no
	 * */

	filter(target) {

		target.query = JSON.stringify(this.content);
		for (let item of target.children) {
			for (let key of Object.keys(this.content)) {
				let keyed = item.querySelector(`[content=${key}]`);
				item.hidden = !keyed.textContent.match(this.content[key]);
			}
		}
	}


	/**
	 * @description - Resets all items to visible, ie removes filter
	 * @cacheable - no
	 * */

	reset(target) {

		for (let item of target.children) item.hidden = false;
	}


	/**
	 * @description Set the css property to display none
	 * @cacheable - no
	 * */

	hide(target) {

		target.hidden = true;
	}


	/**
	 * @description - Unset the css property to display none
	 * @cacheable - no
	 * */

	show(target) {

		target.hidden = false;
	}


	/**
	 * @description - Scrolls the target into view
	 * @cacheable - no
	 * */

	scrollIntoView(target) {

		target.scrollIntoView();
	}


	/**
	 * @description - Triggers popstate thereby removing top backstack entry
	 * @cacheable - no
	 * */

	async back() {

		history.back();
	}
}