const TypeBase = require('./base');
/**
 * Clase para las pruebas que requieren una factoría que ejecutará
 * la función que realizará la prueba.
 *
 * Todas las propiedades del JSON excepto `factory`, `description`
 * y `tests` las decide la factoría así como su uso.
 *
 * ```
 * // sq.js
 * module.exports = function(value) {
 *     return value * value;
 * }
 * ```
 *
 * ```
 * // factory.js
 * module.exports = function(test, done, suiteConfig, testConfig) {
 *     const _fn     = require(test.resolvePath(suiteConfig.module));
 *     const _result = test.check(_fn(...testConfig.params), testConfig.expected);
 *     if (_result instanceof Error)
 *     {
 *         done(_result);
 *     }
 *     else
 *     {
 *         done();
 *     }
 * }
 * ```
 *
 * ```
 * // test.json
 * {
 *     "factory" : "./factory.js",
 *     "module"  : "./my-module",
 *     "tests"   : [
 *         {
 *             "description" : "Testing with factory",
 *             "params"      : [ 100 ],
 *             "expected"    : 10000
 *         }
 *     ]
 * }
 * ```
 *
 * @namespace type
 * @class     type.Factory
 * @extends   type.Base
 */
module.exports = class TypeFactory extends TypeBase {
    /**
     * @override
     */
    addTest(config)
    {
        const _config = this.config;
        let _factory  = _config.factory;
        if (_factory)
        {
            _factory = require(this.resolvePath(_factory));
            it(this.buildTestTitle(config), done => _factory(this, done, _config, config));
        }
    }
};
