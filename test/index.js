import assert from 'assert';
import rapunzel from '../lib/main';

const S_EXPECTS = `// this is the beginning
{
	example: {
		of: 'stringifying a simple object',
		that: 'only has objects and strings',
	},
}
// this is the end`;


describe('rapunzel', function() {

	var h_obj = {
		example: {
			of: 'stringifying a simple object',
			that: 'only has objects and strings',
		},
	};

	var stringify_obj = function(add, h_part, b_first_line) {
		if('string' === typeof h_part) {
			add(`'${h_part.replace(/'/g, '\\\'')}'`, true);
		}
		else {
			add.open('{', ',', !b_first_line);
			for(var s_property in h_part) {
				add(s_property+': ');
				stringify_obj(add, h_part[s_property]);
			}
			add.close('}');
		}
	};

	var k_builder = rapunzel({
		preamble: function(add) {
			add('// this is the beginning');
		},
		body: function(add) {
			stringify_obj(add, h_obj, true);
		},
		closing: function(add) {
			add('// this is the end');
		},
	}, ['preamble', 'body', 'closing']);


	it('allows devoid options', () => {
		k_builder.produce();
	});

	it('works!', function() {

		var s_output = k_builder.produce({
			indent: '\t',
		});

		assert.strictEqual(S_EXPECTS, s_output);
	});

	it('.remove()', function() {

		k_builder.remove('preamble');

		var s_output = k_builder.produce({
			indent: '\t',
		});

		assert.strictEqual(S_EXPECTS.replace(/^[^\n]*\n/, ''), s_output);
	});
});
