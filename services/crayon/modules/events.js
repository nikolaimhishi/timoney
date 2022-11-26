import {Network} from './network.js';
import {Views} from './views.js';
import {Models} from './models.js';

export const Events = new class {


	listen(selector, handler) {


		/**@defined*/

		let declared = selector.match(/@[A-Za-z]+/g) || [];
		for (let event of declared) {


			/**@handler*/

			let type = event.slice(1);
			selector = selector.replace(event, `[${type}]`);
			window.addEventListener(type, Events.dispatch.bind({handler}));
		}


		/**@observable*/

		return selector;
	}


	async dispatch(event) {


		/**@target*/

		const target = event.target instanceof Window ? document.firstElementChild : event.target;


		/**@flag*/

		target.setAttribute(event.type, '');
		(typeof this.handler === 'function') && this.handler(event);
		await new Promise(r => setTimeout(r, 1000)); // todo  // requestIdleCallback or hook into, observable animationend
		target.removeAttribute(event.type);
	}
}

Events.listen('@click', async function (event) {


	/**@ignore*/

	let link = event.target;
	if (!(link instanceof HTMLAnchorElement)) link = link.closest('a[href]');
	if (!link) return;


	/**@href*/

	let href = link.getAttribute('href');
	if (!href) return;
	event.preventDefault();


	/**@anchor*/

	if (href[0] === '#') return Views.scrollIntoView(document.querySelector(href));


	/**@back*/

	if (link.hasAttribute('back')) return history.back();


	/**@ignore*/

	if (link.href === window.location.href) return;


	/**@first*/

	if (!history.state) history.replaceState('🌈', null, link.href);


	/**@next*/

	else history.pushState('🌈', null, link.href);


	/**@render*/

	let component = window.location.pathname.split('/').pop();
	if (window.components[component]) document.body.innerHTML = window.components[component].render({}, window.components);


	/**@view*/

	let _id = new URLSearchParams(link.search).get('_id');
	if (_id) document.body.setAttribute('data-object', _id);
});

Events.listen('form@submit', async event => {


	event.preventDefault();


	/**@request*/

	let enqueue = event.target.hasAttribute('cache');
	let method = event.target.getAttribute('method') || event.target.getAttribute('formaction') || 'get';
	let body, url = event.target.href || event.target.action || event.target.formAction;


	/**@form-body*/

	let isForm = event.target instanceof HTMLFormElement;
	if (isForm) body = new FormData(event.target);


	/**@button-body*/

	let isBtn = event.target instanceof HTMLButtonElement;
	if (isBtn) body = event.target.name && JSON.stringify({[event.target.name]: event.target.value});


	/**@send*/

	try {

		let content;
		event.target.dispatchEvent(new CustomEvent('pending', {detail: toJSON()}));
		event.target.dispatchEvent(new CustomEvent('success', {detail: content = await Network.send(method, url, body, event.timeStamp, enqueue)}));
		if (enqueue) await Models.save(content);
	}
	catch (error) {

		// maybe split into different types of errors eg offline|server
		event.target.dispatchEvent(new CustomEvent('error', {detail: {error}}));
	}


	/**@data*/

	function toJSON() {

		let data = {};
		let params = isForm ? new FormData(event.target) : new URLSearchParams(event.target.search);
		params.sort && params.sort();


		/**@normalize*/

		for (let e of params.entries()) {
			let key = e[0];
			let val = e[1];
			data[key] = data[val] ? [].concat(data[key], val) : val;
		}


		/**@object*/

		if (Object.keys(data).length) data._ts = event.timeStamp;
		return data;
	}
});

Events.listen('@pending', {});

Events.listen('@error', {
	// todo load app in err state
});

Events.listen('@success', {});

Events.listen('@popstate', async event => {

	/**@re-render*/

	let component = window.location.pathname.split('/').pop();
	if (window.components[component]) document.body.innerHTML = window.components[component].render({}, window.components);
});

Events.listen('@focused', event => {

	if (!event.target.form.FORM_DEFAULTS_HASH) event.target.form.FORM_DEFAULTS_HASH = hash(Readable.formToJSON(event.target.form));
	return true;

	function hash(obj) {


		let string = '';
		let flattened = flatten(obj);
		let sorted = Object.keys(flattened).sort((a, b) => a > b ? 1 : -1);
		for (let key of sorted) string += `${encodeURIComponent(key)}=${encodeURIComponent(flattened[key])}&`;
		return getHash(string);


		/**
		 * @hash
		 * */

		function getHash(s) {
			let hash = 5381;
			let i = s.length;
			while (i) hash = (hash * 33) ^ s.charCodeAt(--i);
			return hash;
		}


		/**
		 * @deflate
		 * */

		function flatten(obj, path = '', deflated = {}) {
			for (let key of Object.keys(obj)) if (obj[key] instanceof Object) this.flatten(obj[key], path ? `${path}.${key}` : `${key}`, deflated); else deflated[`${path ? path + '.' : ''}${key}`] = obj[key];
			return deflated;
		}
	}
});

Events.listen('@focusin', {});

Events.listen('@focusout', {});

Events.listen('@filling', {});

Events.listen('@erase', {});

Events.listen('@change', {});

Events.listen('@attachment', {});

Events.listen('@querying', event => {

	clearTimeout(event.target.FILTERING_INPUT);
	event.target.FILTERING_INPUT = setTimeout(e => delete event.target.FILTERING_INPUT && this.dispatch('filtering', event.target, e), 750, event);
});

Events.listen('@invalid', {});

Events.listen('@reset', {});

Events.listen('@intersecting', {
	// --INTERSECTION-DURATION, --INTERSECTED-PERCENTAGE, dispatch(scrollingUP|..., entry.target.parent), saved-definedStates --> .item:not(.in--entered)
});

Events.listen('@entering', {
	// (element now coming onscreen)
});

Events.listen('@entered', {
	// (element now shown onscreen)
});

Events.listen('@exiting', {
	//   (element now going offscreen)
});

Events.listen('@exited', {
	// (element now gone offscreen)
});

Events.listen('@connected', {});

Events.listen('@disconnected', {});

Events.listen('@notification', {});

Events.listen('@online', event => {
	Network.fetch().then();
});

Events.listen('@offline', {});

Events.listen('@pointermovej', event => {

	JSON.parse(event.target.style.getPropertyValue('--POINTER-START-T') || false);
});

Events.listen('@pointerdown', event => {

	event.target.style.removeProperty('--POINTER-START-T');
	event.target.style.removeProperty('--POINTER-START-X');
	event.target.style.removeProperty('--POINTER-START-Y');
});

Events.listen('@pointerup', event => {

	event.target.style.removeProperty('--POINTER-START-T');
	event.target.style.removeProperty('--POINTER-START-X');
	event.target.style.removeProperty('--POINTER-START-Y');
});

Events.listen('@doubletap', event => {

});

Events.listen('@longtap', async event => {

	await new Promise(resolve => setTimeout(resolve, 800));
	return event.timeStamp === parseFloat(event.target.style.getPropertyValue('--POINTER-START-T')) && !JSON.parse(event.target.style.getPropertyValue('--POINTER-IS-SWIPING') || false);
});

Events.listen('@scroll', async event => {

	await new Promise(requestAnimationFrame);
	event.target.style.setProperty('--SCROLL-NOW-X', event.target.scrollLeft);
	event.target.style.setProperty('--SCROLL-NOW-Y', event.target.scrollTop);
});

Events.listen('@scrollingup', event => {

	let previous = JSON.parse(event.target.style.getPropertyValue('--SCROLL-PREVIOUS-Y') || 0);
	let already = JSON.parse(event.target.style.getPropertyValue('--SCROLL-IS-SCROLLING-UP') || false);
	let enroute = event.target.scrollTop < previous;

	event.target.style.setProperty('--SCROLL-PREVIOUS-Y', event.target.scrollTop);
	event.target.style.setProperty('--SCROLL-IS-SCROLLING-UP', enroute);
	return !already && enroute;
});

Events.listen('@scrollingdown', event => {

	let previous = JSON.parse(event.target.style.getPropertyValue('--SCROLL-PREVIOUS-Y') || 0);
	let already = JSON.parse(event.target.style.getPropertyValue('--SCROLL-IS-SCROLLING-DOWN') || false);
	let enroute = event.target.scrollTop > previous;

	event.target.style.setProperty('--SCROLL-PREVIOUS-Y', event.target.scrollTop);
	event.target.style.setProperty('--SCROLL-IS-SCROLLING-DOWN', enroute);
	return !already && enroute;
});

Events.listen('@scrollingleft', event => {

	let previous = JSON.parse(event.target.style.getPropertyValue('--SCROLL-PREVIOUS-X') || 0);
	let already = JSON.parse(event.target.style.getPropertyValue('--SCROLL-IS-SCROLLING-LEFT') || false);
	let enroute = event.target.scrollLeft < previous;

	event.target.style.setProperty('--SCROLL-PREVIOUS-X', event.target.scrollLeft);
	event.target.style.setProperty('--SCROLL-IS-SCROLLING-LEFT', enroute);
	return !already && enroute;
});

Events.listen('@scrollingright', event => {

	let previous = JSON.parse(event.target.style.getPropertyValue('--SCROLL-PREVIOUS-X') || 0);
	let already = JSON.parse(event.target.style.getPropertyValue('--SCROLL-IS-SCROLLING-RIGHT') || false);
	let enroute = event.target.scrollLeft > previous;

	event.target.style.setProperty('--SCROLL-PREVIOUS-X', event.target.scrollLeft);
	event.target.style.setProperty('--SCROLL-IS-SCROLLING-RIGHT', enroute);
	return !already && enroute;
});

Events.listen('@swipestart', event => {

	let thresholdX = Math.abs(event.clientX - JSON.parse(event.target.style.getPropertyValue('--POINTER-START-X'))) > 3;
	let thresholdY = Math.abs(event.clientY - JSON.parse(event.target.style.getPropertyValue('--POINTER-START-Y'))) > 3;
	if (!thresholdX && !thresholdY && !JSON.parse(event.target.style.getPropertyValue('--POINTER-IS-SWIPING') || false)) return false;
	event.target.style.setProperty('--POINTER-IS-SWIPING', 'true');
});

Events.listen('@swiping', event => {

	event.previousX = JSON.parse(event.target.style.getPropertyValue('--SWIPER-PREVIOUS-X'));
	event.previousY = JSON.parse(event.target.style.getPropertyValue('--SWIPER-PREVIOUS-Y'));

	event.target.style.setProperty('--SWIPER-X', `${event.clientX - JSON.parse(event.target.style.getPropertyValue('--POINTER-START-X'))}`);
	event.target.style.setProperty('--SWIPER-Y', `${event.clientY - JSON.parse(event.target.style.getPropertyValue('--POINTER-START-Y'))}`);

	event.target.style.setProperty('--SWIPER-PREVIOUS-X', event.clientX);
	event.target.style.setProperty('--SWIPER-PREVIOUS-Y', event.clientY);
});

Events.listen('@swipingup', event => {

	return event.clientY < event.previousY;
});

Events.listen('@swipingdown', event => {

	return event.clientY > event.previousY;
});

Events.listen('@swipingleft', event => {

	return event.clientX < event.previousX;
});

Events.listen('@swipingright', event => {

	return event.clientX > event.previousX;
});

Events.listen('@swipeend', event => {

	if (!JSON.parse(event.target.style.getPropertyValue('--POINTER-IS-SWIPING') || false)) return false;
	event.startX = JSON.parse(event.target.style.getPropertyValue('--SWIPER-START-X'));
	event.startY = JSON.parse(event.target.style.getPropertyValue('--SWIPER-START-Y'));
	event.duration = event.timeStamp - JSON.parse(event.target.style.getPropertyValue('--POINTER-START-T'));
});

Events.listen('@swipedup', event => {

	let magnitude = event.startY - event.clientY;
	return event.swipedUp = magnitude > 50 && event.duration < 300 || magnitude > screen.width * 0.55 || magnitude > 300;
});

Events.listen('@swipeddown', event => {

	let magnitude = event.clientY - event.startY;
	return event.swipedDown = magnitude > 50 && event.duration < 300 || magnitude > screen.width * 0.55 || magnitude > 300;
});

Events.listen('@swipedleft', event => {

	let magnitude = event.startX - event.clientX;
	return event.swipedLeft = magnitude > 50 && event.duration < 300 || magnitude > screen.width * 0.55 || magnitude > 300;
});

Events.listen('@swipedright', event => {

	let magnitude = event.clientX - event.startX;
	return event.swipedRight = magnitude > 50 && event.duration < 300 || magnitude > screen.width * 0.55 || magnitude > 300;
});

Events.listen('@swipedupcancel', event => {

	return !(event.swipedUp || event.swipedDown || event.swipedLeft || event.swipedRight);
});