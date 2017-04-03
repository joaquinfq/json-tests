const TypeBase = require('./base');
/**
 * Clase para realizar pruebas unitarias a los métodos no asíncronos de una clase.
 *
 * ```
 * // my-class.js
 * module.exports = class MyClass {
 *     constructor(value)
 *     {
 *         this.value = value;
 *     }
 *
 *     sum(value)
 *     {
 *         return this.value + value;
 *     }
 * }
 * ```
 *
 * ```
 * // test.json
 * {
 *     "class" : "./my-class.js",
 *     "tests" : [
 *         {
 *             "description" : "Testing constructor",
 *             "construct"   : [ 100 ],
 *             "property"    : "value",
 *             "expected"    : 100
 *         },
 *         {
 *             "description" : "Testing `sum` method",
 *             "construct"   : [ 1 ],
 *             "method"      : "sum",
 *             "params"      : [ 2 ]
 *             "expected"    : 3
 *         }
 *     ]
 * }
 * ```
 *
 * Es equivalente a:
 *
 * ```
 * const MyClass = require('../my-class');
 *
 * // Testing constructor
 * const instance = new MyClass(100);
 * assert.strictEqual(instance.value, 100);
 *
 * // Testing `sum` method
 * const instance = new MyClass(1);
 * assert.strictEqual(instance.sum(2), 3);
 * ```
 *
 * También se puede reusar la misma instancia durante las pruebas e ir verificando los pasos:
 *
 * ```
 * // test2.json
 * {
 *     "class"     : "./my-class.js",
 *     "construct" : [ 250 ],
 *     "tests"     : [
 *         {
 *             "description" : "Testing constructor",
 *             "property"    : "value",
 *             "expected"    : 250
 *         },
 *         {
 *             "description" : "Testing `sum` method",
 *             "method"      : "sum",
 *             "params"      : [ 20 ]
 *             "expected"    : 270
 *         }
 *     ]
 * }
 * ```
 *
 * Sería equivalente a:
 *
 * ```
 * const MyClass = require('../my-class');
 *
 * const instance = new MyClass(250);
 * // Testing constructor
 * assert.strictEqual(instance.value, 250);
 * // Testing `sum` method
 * assert.strictEqual(instance.sum(20), 270);
 * ```
 *
 *
 *
 * @namespace type
 * @class     type.Class
 * @extends   type.Base
 */
module.exports = class TypeClass extends TypeBase {
    /**
     * @override
     */
    constructor(config)
    {
        super(config);
        /**
         * Instancia a usar para todas las pruebas.
         *
         * @type {null|Function}
         */
        this.sut = null;
    }

    /**
     * @override
     */
    addTest(config)
    {
        const _config = this.config;
        let _class    = _config.class;
        if (_class)
        {
            it(
                this.buildTestTitle(config),
                done =>
                {
                    let _sut = this.sut;
                    if (!_sut)
                    {
                        _sut = this.__buildClass(
                            {
                                class     : _class,
                                construct : config.construct
                            }
                        );
                    }
                    try
                    {
                        const _result = this.check(
                            'property' in config
                                ? _sut[config.property]
                                : _sut[config.method](...(config.params || [])),
                            config.expected
                        );
                        if (_result instanceof Error)
                        {
                            done(_result);
                        }
                        else
                        {
                            done();
                        }
                    }
                    catch (e)
                    {
                        if (e.message === config.exception)
                        {
                            done();
                        }
                        else
                        {
                            done(e);
                        }
                    }
                }
            );
        }
    }

    /**
     * @override
     */
    addTests()
    {
        if (this.config.construct)
        {
            this.sut = this.__buildClass(this.config);
        }
        super.addTests();
    }

    /**
     * Construye la clase bajo pruebas.
     *
     * @param config
     * @private
     */
    __buildClass(config)
    {
        const _class = require(this.resolvePath(config.class));
        //
        return new _class(...(config.construct || []));
    }
};
