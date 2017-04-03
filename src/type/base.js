const assert = require('assert');
const chalk  = require('chalk');
const path   = require('path');
/**
 * Clase base para los tipos de archivos de pruebas.
 *
 * @namespace type
 * @class     type.Base
 */
module.exports = class TypeBase {
    /**
     * Constructor de la clase.
     *
     * @param {Object} config Contenido del archivo JSON con las pruebas.
     *
     * @constructor
     */
    constructor(config)
    {
        /**
         * Configuración leída del archivo JSON.
         *
         * @type {Object}
         */
        this.config = config || {};
        //----------------------------------------------------------------------------------
        const _tests = config.tests;
        if (Array.isArray(_tests))
        {
            //------------------------------------------------------------------------------
            // Si hay una clave common la fusionamos con cada uno de las pruebas.
            //------------------------------------------------------------------------------
            const _common      = config.common || {};
            _common.__dirname  = config.__dirname;
            _common.__filename = config.__filename;
            _tests.forEach((test, index) => _tests[index] = Object.assign({}, _common, test));
        }
    }

    /**
     * Agrega una prueba.
     * En la clase base no tiene uso salvo probar el funcionamiento del entorno.
     *
     * @param {Object} config Configuración leída del archivo JSON.
     */
    addTest(config)
    {
        it(this.buildTestTitle(config), () => this.check(config.actual, config.expected));
    }

    /**
     * Agrega las pruebas existentes en un archivo JSON.
     */
    addTests()
    {
        const _tests = this.config.tests;
        if (Array.isArray(_tests))
        {
            _tests.forEach(
                (test, index) =>
                {
                    test.__index = index;
                    this.addTest(test)
                }
            );
        }
    }

    /**
     * Construye el título de la suite de pruebas.
     *
     * @return {String} Título de la suite.
     */
    buildSuiteTitle()
    {
        const _config = this.config;
        //--
        return `${_config.description} (${chalk.magenta(_config.__filename.replace(_config.__rootDir + path.sep, ''))})`;
    }

    /**
     * Construye el título de la prueba.
     *
     * @param {Object} config Configuración de la prueba leída del archivo JSON.
     *
     * @return {String} Título de la prueba.
     */
    buildTestTitle(config)
    {
        const _description = config.description
            ? ` -- ${chalk.cyan(config.description)}`
            : '';
        return `Test #${config.__index + 1}${_description}`;
    }

    /**
     * Compara los valores usando el módulo `assert`.
     * Si no son iguales devuelve la excepción para que sea procesada.
     *
     * @param {Object} actual   Valor devuelto por la ejecución.
     * @param {Object} expected Valor esperado.
     *
     * @return {Boolean|Error} `true` si la comparación fue exitosa o un error en caso contrario.
     */
    check(actual, expected)
    {
        let _result;
        try
        {
            assert.deepEqual(actual, expected);
            _result = true;
        }
        catch (e)
        {
            _result = e;
        }
        return _result;
    }

    /**
     * Configura la suite para agregando las pruebas configuradas en la clase al entorno de pruebas.
     */
    configure()
    {
        const _config = this.config;
        const _tests  = _config.tests;
        if (Array.isArray(_tests))
        {
            describe(
                this.buildSuiteTitle(_config),
                () =>
                {
                    after(() => this.constructor.tearDown());
                    before(done => this.constructor.setUp(done));
                    this.addTests(_config)
                }
            );
        }
        else
        {
            console.log('No tests found in file %s', chalk.cyan(_config.__filename));
        }
    }

    /**
     * Resuelve la ruta especificada con respecto a la ruta del archivo JSON.
     *
     * @param {String} filename Ruta del archivo a resolver.
     */
    resolvePath(filename)
    {
        return path.resolve(this.config.__dirname, filename);
    }

    /**
     * Método que se llama antes de lanzar las pruebas.
     *
     * @param {Function} done Callback a ejecutar cuando se pueda continuar con las pruebas.
     */
    static setUp(done)
    {
        if (typeof done === 'function')
        {
            done();
        }
    }

    /**
     * Método que se llama al finalizar todas las pruebas de la suite.
     */
    static tearDown()
    {
    }
};
