import {Views} from './views.js';


/**
 * @description - Reads and writes local persistent data
 * */

export const Models = new class {


	/**
	 * @description - Prepend or Append list item
	 * */

	async put(id, path = [], data, mode) {


		/**@node*/

		let tree = await Models.read(id);
		if (!tree) return;
		let node = tree;


		/**@path*/

		while (path.length) {
			node = node[path[0]];
			if (path.length === 1 && !(node instanceof Array)) return;
			if (!node) return;
			path.shift();
		}


		/**@old*/

		let old = node.findIndex(obj => obj._id === data._id);
		if (old !== -1) old = node.splice(old, 1);


		/**@save*/

		if (mode.match(/first|last/)) data = old;
		if (mode.match(/prepend|first/)) node.unshift(data);
		if (mode.match(/append|last/)) node.push(data)
		await Models.save(tree);
	}


	/**
	 * @description - Merge changes object into current object
	 * */

	async patch(changes, replace) {


		/**@Save*/

		for (let data of [].concat(changes || {})) {
			let object = await Models.read(data._id);
			if (!replace) update(object, data);
			await this.save(object);
		}


		/**@Helper*/

		function update(current, changes, prepend = true) {


			/**@overwrite*/

			for (let key of Object.keys(changes))
				if (current[key] instanceof Array || changes[key] instanceof Array)
					current[key] = prepend ? [].concat(changes[key], current[key]) : [].concat(current[key], changes[key]); // todo ensure unique array elements if {_id} objects
				else current[key] instanceof Object && changes[key] instanceof Object ? update(changes[key], current[key], prepend) : current[key] = changes[key];


			/**@render*/

			Views.merge.call({content: changes});
		}
	}


	/**
	 * @description - Deletes the objects with given id
	 * @todo find the foreign objects that aren't in use and also remove them
	 * */

	async delete(id) {


		/**@DB*/

		const objectStore = window.localforage.createInstance({name: `crayon-objects-${window.uid}`});
		const stateStore = window.localforage.createInstance({name: `crayon-states-${window.uid}`});
		await objectStore.removeItem(id, null);
		await stateStore.removeItem(id, null);


		/**@UI*/

		return Views.remove(`[data-object${id}]`);
	}


	/**
	 * @description - Changes object attribute state based on the specified mode
	 * */

	async transition(id, mode, state) {

		const states = await window.localforage.createInstance({name: `crayon-states-${window.uid}`}).getItem(id) || [];
		const index = states.indexOf(state);
		switch (mode){

			case 'set':
				if (index === -1) states.push(states);
				break;

			case 'toggle':
				index === -1 ? states.push(state) : states.splice(index, 1);
				break;

			case 'remove':
				if (index !== -1) states.splice(index, 1);
				break;

			case 'radio':
				// todo iterate all objects in statesStorage
				break;
		}

		await states.setItem(id, states);
		return `[data-object=${id}]`;
	}


	/**
	 * @description - Disjoin embedded objects and denormalize
	 * */

	async save(objects) {


		/**@objects*/

		let saved = [];
		for (let object of [].concat(objects)) {


			/**@non-object*/

			if (!(object && typeof object === 'object' && object['_id'])) {
				saved.push(object);
				continue;
			}


			/**@object*/

			const id = `__fk::${object['_id']}::fk__`;
			for (let field of Object.keys(object)) object[field] = await this.save(object[field]);



			/**@states*/

			for (let field of Object.keys(object))
				if (typeof object[field] === 'boolean')
					await this.transition(id, object[field] ? 'set' : 'remove', field);


			/**@save*/

			await window.localforage.createInstance({name: `crayon-objects-${window.uid}`}).setItem(id, object);
			saved.push(id);
		}


		/**@ids*/

		return saved.length === 1 ? saved[0] : saved;
	}


	/**
	 * @description - Joins objects and returns as normalized
	 * */

	async read(ids) {


		/**@ids*/

		let found = [];
		for (let id of [].concat(ids)) {


			/**@non-ids*/

			if (!(id && typeof id === 'string' && id.match(RegExp(`__fk::[#\\-\\w\\s]+::fk__`, 'ig')))) {
				if (id instanceof Blob) id = URL.createObjectURL(id);
				found.push(id);
				continue;
			}


			/**@join*/

			let object = await window.localforage.createInstance({name: `crayon-objects-${window.uid}`}).getItem(id);
			for (let field of Object.keys(object)) object[field] = await this.read(id[field]);



			/**@states*/


			let states = await window.localforage.createInstance({name: `crayon-states-${window.uid}`}).getItem(id);
			for (let field of Object.keys(object)) if (typeof object[field] === 'boolean') object[field] = states.includes(field);
			for (let state of states) if (!(state in object)) object[state] = true;
			found.push(object);
		}


		/**@objects*/

		return ids ? ids.length === 1 ? found[0] : found : ids;
	}
}