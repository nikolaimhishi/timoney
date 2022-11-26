import {Observer} from '../../crayon/modules/observer.js';

Observer.observe('html:not(authenticated)', {

	'#feed :nth-child(2)': {

		setAttributes: 'names of attributes',
		unsetAttributes: 'names of attributes',
		prependItem: 'names of lists',
		runCallback: 'names of functions',
		toggleClass: 'names of classes',
		hideItem: 'duration'
	},

	'#feed :nth-child(3)': {
		setAttributes: 'names of attributes',
		unsetAttributes: 'names of attributes',
		prependItem: 'names of lists',
		runCallback: 'names of functions',
		toggleClass: 'names of classes',
		hideItem: 'duration',
		dispatch: 'some states'
	},

	'footer[is-intersecting]': {
		setAttributes: 'names of attributes',
		unsetAttributes: 'names of attributes',
		prependItem: 'names of lists',
		runCallback: 'names of functions',
		toggleClass: 'names of classes',
		hideItem: 'duration'
	},

	'#login-form[status=\'200\']': {
		setAttributes: 'names of attributes',
		unsetAttributes: 'names of attributes',
		prependItem: 'names of lists',
		runCallback: 'names of functions',
		toggleClass: 'names of classes',
		hideItem: 'duration'
	},

	'#password-input[status=\'404\']': {
		setAttributes: 'names of attributes',
		unsetAttributes: 'names of attributes',
		prependItem: 'names of lists',
		runCallback: 'names of functions',
		toggleClass: 'names of classes',
		hideItem: 'duration'
	},

	'[chat-is-selected] .chat:not(selected)[click]': {
		setAttributes: 'names of attributes',
		unsetAttributes: 'names of attributes',
		prependItem: 'names of lists',
		runCallback: 'names of functions',
		toggleClass: 'names of classes',
		hideItem: 'duration'
	},

	'#privacy-policy button[close][click]': {
		setAttributes: 'names of attributes',
		unsetAttributes: 'names of attributes',
		prependItem: 'names of lists',
		runCallback: 'names of functions',
		toggleClass: 'names of classes',
		hideItem: 'duration'
	},

	'audio:not([paused])': {
		setAttributes: 'names of attributes',
		unsetAttributes: 'names of attributes',
		prependItem: 'names of lists',
		runCallback: 'names of functions',
		toggleClass: 'names of classes',
		hideItem: 'duration'
	},

	'.pill:first-child[click]': {
		setAttributes: 'names of attributes',
		unsetAttributes: 'names of attributes',
		prependItem: 'names of lists',
		runCallback: 'names of functions',
		toggleClass: 'names of classes',
		hideItem: 'duration'
	}
});