
// native imports


// libraries
import arginfo from 'arginfo';
import classer from 'classer';


/**
* private static:
**/


/**
* class:
**/
const local = classer('Rapunzel', function(h_init_productions, a_init_steps=[]) {

	/**
	* private:
	**/

	// steps & productions
	let a_steps = [];
	let h_productions = new Map();

	// initialize from constructor input
	(() => {

		// transfer productions from initial hash to internal map
		for(let s_step in h_init_productions) {
			h_productions.set(s_step, h_init_productions[s_step]);

			// no init steps
			if(!a_init_steps.length) {

				// add in key order
				a_steps.push(s_step);
			}
		}

		// copy steps from initial array to internal array
		a_init_steps.forEach((s_step) => {
			a_steps.push(s_step);
		});
	})();


	//
	const insert_productions = (s_relative_step, n_offset, h_insert_productions, a_insert_step_order) => {

		// find the step to insert relative to
		let i_step_relate = a_steps.indexOf(s_relative_step);

		// step does not exist
		if(-1 === i_step_relate) {
			local.fail('no such step "'+s_relative_step+'"');
		}

		// insert each production to map
		for(let s_step in h_insert_productions) {

			// ref production from hash
			let f_production = h_insert_productions[s_step];

			// production map already has same named step
			if(h_productions.has(s_step)) {
				local.fail('production with same name already exists for "'+s_step+'"');
			}
			// given production is not a function
			else if('function' !== typeof f_production) {
				local.fail('production must be a [function]. for key "'+s_step+'", got: '+arginfo(f_production));
			}
			// insert mapping normally
			else {
				h_productions.set(s_step, f_production);
			}
		}

		// no step order given
		if(!a_insert_step_order) {

			// create from order of keys in hash
			a_insert_step_order = Object.keys(h_insert_productions);
		}

		// insert new steps into appropriate place
		a_steps.splice.apply(a_steps, [i_step_relate+n_offset, 0].concat(a_insert_step_order));
	};


	//
	const produce_string = (h_options, h_forward) => {

		// prepare links of strings
		let a_chunks = [];

		//
		let s_newline = '';
		let s_indent = '';
		let s_close = '';
		let n_indentation = 0;
		let s_indent_space = '';
		let a_closers = [];

		//
		let b_pretty = true;

		//
		if(h_options) {

			// pretty option
			if(false === h_options.pretty) {
				b_pretty = false;
			}

			// closer
			if(h_options.close) {
				s_close = h_options.close;
			}
		}

		// set pretty defaults
		if(b_pretty) {
			s_newline = '\n';
			s_indent_space = '\t';
		}

		// override indent character
		if(h_options && h_options.indent) {
			s_indent_space = h_options.indent;
		}

		// init closers list
		a_closers.push(s_close);

		//
		let add = classer.operator(function(s_chunk, z_merge_delim=false, b_ignore_close=false) {

			// append close delim
			if(!b_ignore_close) {
				s_chunk += s_close;
			}

			// do not insert on new line
			if(false !== z_merge_delim && a_chunks.length) {
				let s_previous = a_chunks.pop();
				s_previous = s_previous.substr(0, s_previous.length-s_close.length);
				let s_merge = (true === z_merge_delim? '': z_merge_delim);
				a_chunks.push(s_previous+s_merge+s_chunk);
			}
			// new chunk
			else {
				a_chunks.push(s_indent+s_chunk);
			}
		}, {

			//
			pretty: b_pretty,
			ugly: !b_pretty,

			// adds blankline(s)
			blank: function(n_newlines) {
				if('number' === typeof n_newlines) {
					for(let i=0; i<n_newlines; i++) {
						a_chunks.push('');
					}
				}
				else {
					a_chunks.push('');
				}
			},

			// block open helper
			open: function(s_line, s_close_delim, z_merge_delim) {

				// open block
				add(
					s_line || '',
					z_merge_delim,
					true
				);

				// set close delim
				s_close = ('string' === typeof s_close_delim)? s_close_delim: a_closers.slice(-1)[0];
				a_closers.push(s_close);

				// increase indentation
				add.tabs += 1;
			},

			//
			close: function(s_line, z_merge_delim) {

				// decrease indentation
				add.tabs -= 1;

				// pop close delim
				a_closers.pop();
				s_close = a_closers.slice(-1)[0];

				// close block
				add(s_line || '', z_merge_delim);
			},
		});

		// define properties on the interface
		Object.defineProperties(add, {

			// lets user adjust width of indentation using += -=
			tabs: {
				get: function() {
					return n_indentation;
				},
				set: function(n_value) {
					s_indent = s_indent_space.repeat(n_value);
					n_indentation = n_value;
				},
			},
		});

		//
		let h_option = {};

		// synchronous each step
		a_steps.forEach((s_step) => {

			// no production!
			if(!h_productions.has(s_step)) {
				local.fail('production not found: "'+s_step+'"');
			}

			// ref production
			let f_production = h_productions.get(s_step);

			// execute production
			let z_result = f_production.apply(add, [add, h_option]);
		});

		//
		return a_chunks.join(s_newline || ' ');
	};


	//
	return {

		//
		after(s_step, h_insert_productions, a_insert_step_order) {

			//
			insert_productions(s_step, 1, h_insert_productions, a_insert_step_order);
		},

		//
		before(s_step, h_insert_productions, a_insert_step_order) {

			//
			insert_productions(s_step, 0, h_insert_productions, a_insert_step_order);
		},

		//
		set(s_step, f_production) {

			// step must exist
			if(-1 === a_steps.indexOf(s_step)) {
				local.fail('no such step found: '+s_step);
			}
			// assert production is function
			else if('function' !== typeof f_production) {
				local.fail('production must be [function]. for key "'+s_step+'", got: '+arginfo(f_production));
			}

			//
			h_productions.set(s_step, f_production);
		},

		// 
		remove(s_step) {

			// step exists
			if(-1 !== a_steps.indexOf(s_step)) {

				// remove first matching element from array
				a_steps.splice(a_steps.indexOf(s_step), 1);

				// yes, we removed the step
				return true;
			}

			// nothing change
			return false;
		},

		//
		produce(h_options) {

			//
			return produce_string(h_options);
		},
	};
}, {

/**
* public static:
**/

});


export default local;
