
// native imports


// libraries
import arginfo from 'arginfo';


/**
* private static:
**/

// meta class setup
const __class_name = 'Rapunzel';


// class constants


/**
* @class TTLProducer
* using closure for private methods and fields
**/
const __construct = function(h_init_productions, a_init_steps=[]) {

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
	const produce_query = (h_options, h_forward) => {

		// prepare links of strings
		let a_chunks = [];

		//
		let s_newline = '';
		let s_indent_space = '';

		//
		let b_pretty = true;

		//
		if(h_options) {

			// pretty option
			if(false === h_options.pretty) {
				b_pretty = false;
			}
		}

		//
		if(b_pretty) {
			s_newline = '\n';
			s_indent_space = '\t';
		}

		// custom options
		if(h_options && h_options.indent) {
			s_indent_space = h_options.indent;
		}

		//
		let s_indent = '';
		let a_closers = [h_options.close || ''];
		let s_close = a_closers[0];

		// apply this context to each production callback
		let k_context = Object.create({
			pretty: b_pretty,
			tab_value: 0,


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


			// adds text chunk to string
			add: function(s_chunk, z_merge_delim, b_ignore_close) {

				// append close delim
				if(!b_ignore_close) {
					s_chunk += s_close;
				}

				// do not insert on new line
				if('undefined' !== typeof z_merge_delim && false !== z_merge_delim && a_chunks.length) {
					a_chunks.push(a_chunks.pop().slice(0, -s_close.length)+(true===z_merge_delim? '': z_merge_delim)+s_chunk);
				}
				// new chunk
				else {
					a_chunks.push(s_indent+s_chunk);
				}
			},

			// block open helper
			open: function(s_line, s_close_delim, z_merge_delim) {

				// open block
				this.add(
					s_line,
					z_merge_delim,
					true
				);

				// set close delim
				s_close = ('string' === typeof s_close_delim)? s_close_delim: a_closers[a_closers.length-1];
				a_closers.push(s_close);

				// increase indentation
				this.tabs += 1;
			},

			//
			close: function(s_line, z_merge_delim) {

				// decrease indentation
				this.tabs -= 1;

				// pop close delim
				a_closers.pop();
				s_close = a_closers[a_closers.length-1];

				// close block
				this.add(s_line, z_merge_delim);
			},
		}, {

			// lets user adjust width of indentation using += -=
			tabs: {
				get: function() {
					return this.tab_value;
				},
				set: function(n_value) {
					s_indent = s_indent_space.repeat(n_value);
					this.tab_value = n_value;
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

			// execute production
			let z_result = h_productions.get(s_step).apply(k_context, [k_context.add, h_option]);

			// //
			// if('string' === typeof z_result) {
			//
			// }
			// //
			// else {
			// 	local.fail('return value to production call must be string. instead got '+arginfo(z_produced));
			// }
		});

		//
		return a_chunks.join(s_newline || ' ');
	};


	//
	return new (class {

		//
		after(s_step, h_insert_productions, a_insert_step_order) {

			//
			insert_productions(s_step, 1, h_insert_productions, a_insert_step_order);
		}

		//
		before(s_step, h_insert_productions, a_insert_step_order) {

			//
			insert_productions(s_step, 0, h_insert_productions, a_insert_step_order);
		}

		//
		set(s_step, f_production) {

			// step must exist
			if(!a_steps.includes(s_step)) {
				local.fail('no such step found: '+s_step);
			}
			// assert production is function
			else if('function' !== typeof f_production) {
				local.fail('production must be [function]. for key "'+s_step+'", got: '+arginfo(f_production));
			}

			//
			h_productions.set(s_step, f_production);
		}

		//
		produce(h_options) {

			//
			return produce_query(h_options);
		}

	})();
};



/**
* public static operator() ():
**/
const local = function() {

	//
	return __construct.apply(this, arguments);

	// // called with `new`
	// if(this !== __namespace) {
	// 	return __construct.apply(this, arguments);
	// }
	// // called directly
	// else {
	// 	return local.fail('not allowed to call '+local+' without `new` operator');
	// }
};

/**
* public static:
**/
{

	//
	local.toString = function() {
		return __class_name+'()';
	};

	// prefix output messages to console with class's tag
	require('./log-tag.js').extend(local, __class_name);
}

export default local;
