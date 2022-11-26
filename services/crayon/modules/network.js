/**
 * @description - Sends and receives data to and from server
 * @todo - exempt queueing of read requests eg search-feed
 * */

export const Network = new class {


	/**
	 * @description - Contains heap of response callbacks
	 * */

	callbacks = {};

	constructor() {

		this.dequeue().then();
	}


	/**
	 * @description - Push the request to a pending queue
	 * @note - the body allowed here is either JSON or Blobs, to allow localForage persistence
	 * @todo - if queueable, convert body to json, if it's of FormData
	 * */

	async send(method, url, body, stamp = Date.now(), enqueue) {


		/**@request*/

		const queue = await window.localforage.getItem('queue') || [];
		await window.localforage.setItem('queue', [].concat(queue, {method, url, body, stamp, enqueue}));
		return await new Promise(async (resolved, erred) => (this.callbacks[stamp] = {resolved, erred}) && await this.fetch());
	}


	/**
	 * @description - Fetch request and commit changes
	 * */

	async fetch() {


		/**@busy*/

		if (this.pending) return;
		let queue = await window.localforage.getItem('queue');
		if (!queue || !queue.length) return;


		/**@request*/

		let request = queue[0];
		let callback = this.callbacks[request.stamp];
		this.pending = true;


		try {

			/**@response*/

			let response = await fetch(request.url, {method: request.method, body: request.body});
			if (!response.ok) callback.erred({statusText: response.statusText, status: response.status});
			let content = await response.json();
			if (callback.resolved) await callback.resolved(content);
		}

			/**@offline*/

		catch (e) {

			return; // we will retry when @online
		}


		/**@dequeue*/

		this.dequeue(request.stamp).then();
	}


	/**
	 * @description - Pop the resolved request
	 * */

	async dequeue(stamp) {


		/**@pop*/

		delete this.pending && delete this.callbacks[stamp];
		const queue = await window.localforage.getItem('queue');
		queue && queue.splice(queue.findIndex(r => r.stamp === stamp), 1);


		/**@next*/

		await window.localforage.setItem('queue', queue);
		return queue && queue[0] && this.fetch(queue[0].method, queue[0].url, queue[0].body, queue[0].stamp, queue[0].enqueue);
	}
}