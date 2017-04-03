# json-tests [![stable](http://badges.github.io/stability-badges/dist/stable.svg)](http://github.com/badges/stability-badges)

[![npm install json-tests](https://nodei.co/npm/json-tests.png?mini=true)](https://npmjs.org/package/json-tests/)

Load JSON tests and run each suites and tests inside `mocha`.

You can test http requests, class methods, functions, etc., using only JSON files.

## Usage

*You can see some examples in directory `examples` with differente test types.*

First, you must create a script for configurating the runner and setting directories with JSON files:

```js
// File: my-project-runner.js

const path   = require('path');
const Runner = require('json-tests/src/runner');
const runner = new Runner(
    [
        path.join(__dirname, 'unit')
    ]
);
runner.run();
```

Then, run tests using mocha:

```bash
$ mocha my-project-runner.js
```

## Test types

### Request

`json-tests` use [jf-http-request](https://npmjs.org/package/f-http-request) so
you can configure request using `options` with the keys supported by this module.

In `expected` key you can use `headers` if you want to check if some header is present in response.
 
```js
{
    "description" : "Testing posts",
    "tests"       : [
        {
            "description" : "Get post 1",
            "options"     : {
                "url" : "http://jsonplaceholder.typicode.com/posts/1"
            },
            "expected"    : {
                "statusCode" : 200,
                "body"       : {
                    "userId" : 1,
                    "id"     : 1,
                    "title"  : "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
                    "body"   : "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
                }
            }
        }
    ]
}
```

### Class

If you want to do some unit tests for a class, this is the right type.

```
// my-class.js
module.exports = class MyClass {
    constructor(value)
    {
        this.value = value;
    }
    sum(value)
    {
        return this.value + value;
    }
}
```

```
// test.json
{
    "class" : "./my-class.js",
    "tests" : [
        {
            "description" : "Testing constructor",
            "construct"   : [ 100 ],
            "property"    : "value",
            "expected"    : 100
        },
        {
            "description" : "Testing `sum` method",
            "construct"   : [ 1 ],
            "method"      : "sum",
            "params"      : [ 2 ]
            "expected"    : 3
        }
    ]
}
```
Is equivalent to:

```
const MyClass = require('../my-class');
// Testing constructor
const instance = new MyClass(100);
assert.strictEqual(instance.value, 100);
// Testing `sum` method
const instance = new MyClass(1);
assert.strictEqual(instance.sum(2), 3);
```

You can reuse the same instance between tests setting `construct` key
in JSON root:

```
// test2.json
{
    "class"     : "./my-class.js",
    "construct" : [ 250 ],
    "tests"     : [
        {
            "description" : "Testing constructor",
            "property"    : "value",
            "expected"    : 250
        },
        {
            "description" : "Testing `add` method",
            "method"      : "sum",
            "params"      : [ 20 ]
            "expected"    : 270
        }
    ]
}
```
Similar to:

```
const MyClass = require('../my-class');
const instance = new MyClass(250);
// Testing constructor
assert.strictEqual(instance.value, 250);
// Testing `sum` method
assert.strictEqual(instance.sum(20), 270);
```

### Factory

You can use a factory for evaluating configuration in JSON file.

```
// sq.js
module.exports = function(value) {
    return value * value;
}
```

```
// factory.js
module.exports = function(test, done, suiteConfig, testConfig) {
    const _fn     = require(test.resolvePath(suiteConfig.module));
    const _result = test.check(_fn(...testConfig.params), testConfig.expected);
    if (_result instanceof Error)
    {
        done(_result);
    }
    else
    {
        done();
    }
}
```

```
// test.json
{
    "factory" : "./factory.js",
    "module"  : "./my-module",
    "tests"   : [
        {
            "description" : "Testing with factory",
            "params"      : [ 100 ],
            "expected"    : 10000
        }
    ]
}
```

All keys in JSON except `factory`, `description` and `tests` can be used
by factory.
