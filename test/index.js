import assert from 'assert';
import rapunzel from '../lib';

describe('rapunzel', function() {
	it('works!', function() {
				
		var h_obj = {
			example: {
				of: 'stringifying a simple object',
				that: 'only has objects and strings',
			},
		};

		var stringify_obj = function(add, h_part, s_merge) {
			if('string' === typeof h_part) {
				add("'"+h_part.replace(/'/g, "\\'")+"'", ' ');
			}
			else {
				this.open('{', ',', s_merge);
				for(var s_property in h_part) {
					add(s_property+':');
					stringify_obj.apply(this, [add, h_part[s_property], ' ']);
				}
				this.close('}');
			}
		};

		var k_builder = rapunzel({
			preamble: function(add) {
				add('// this is the beginning');
			},
			body: function(add) {
				stringify_obj.apply(this, [add, h_obj, '']);
			},
			closing: function(add) {
				add('// this is the end');
			},
		});

		var s_output = k_builder.produce({
			indent: '\t',
		});

		console.warn(s_output);
	});
});
