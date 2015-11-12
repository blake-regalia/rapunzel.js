# rapunzel [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]
> This lightweight module simplifies the process of generating code strings


## Install

```sh
$ npm install --save rapunzel
```


## Usage

```js
var rapunzel = require('rapunzel');

var h_obj = {
	"example":
	{
		"of": "stringifying a simple object",
		"that": "only has objects and strings",
	}
};

var stringify_obj = function(add, h_part) {
	if('string' === typeof h_part) {
		add("'"+h_part.replace(/'/g, "\\'")+"'", true);
	}
	else {
		add.open('{', ',', true);
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
		stringify_obj(add, h_obj);
	},
	closing: function(add) {
		add('// this is the end');
	},
});

k_builder.produce({
	indent: '\t',
});
```

yields:
```javascript
// this is the beginning
{
	example: {
		of: 'stringifying a simple object',
		that: 'only has objects and strings',
	},
}
// this is the end
```

## License

ISC © [Blake Regalia]()

<!-- 
[npm-image]: https://badge.fury.io/js/rapunzel.svg
[npm-url]: https://npmjs.org/package/rapunzel
[travis-image]: https://travis-ci.org/blake-regalia/rapunzel.js.svg?branch=master
[travis-url]: https://travis-ci.org/blake-regalia/rapunzel.js
[daviddm-image]: https://david-dm.org/blake-regalia/rapunzel.js.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/blake-regalia/rapunzel.js
 -->