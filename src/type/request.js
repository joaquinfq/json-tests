const jfHttpRequest = require('jf-http-request');
const TypeBase      = require('./base');
/**
 * Clase para realizar comprobaciones contra servidores HTTP.
 * La configuración recibida sigue el formato requerido por el módulo
 * `jf-http-request` para realizar las peticiones.
 *
 * ```
 * {
 *     "description" : "Suite para comprobar los artículos",
 *     "tests"       : [
 *         {
 *             "description" : "Obtiene el artículo 1",
 *             "options"     : {
 *                 "url" : "http://jsonplaceholder.typicode.com/posts/1"
 *             },
 *             "expected"    : {
 *                 "statusCode" : 200,
 *                 "body"       : {
 *                     "userId" : 1,
 *                     "id"     : 1,
 *                     "title"  : "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
 *                     "body"   : "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
 *                 }
 *             }
 *         }
 *     ]
 * }
 * ```
 *
 * @namespace type
 * @class     type.Request
 * @extends   type.Base
 */
class TypeRequest extends TypeBase {
    /**
     * @override
     */
    addTest(config)
    {
        const _options = config.options || {};
        if ('body' in _options)
        {
            _options.body = JSON.stringify(_options.body);
        }
        it(
            this.buildTestTitle(config),
            done => jfHttpRequest(
                Object.assign(
                    {
                        requestType : (response, status) => this.__checkResponse(config, done, response, status)
                    },
                    _options
                )
            )
        );
    }

    /**
     * Verifica la respuesta.
     *
     * @param {Object}               config   Configuración de la prueba leída del archivo JSON.
     * @param {Function}             done     Callback a ejecutar cuando se termine la prueba.
     * @param {http.IncomingMessage} response Respuesta recibida del servidor.
     * @param {String}               status   Estado de la respuesta.
     *
     * @private
     */
    __checkResponse(config, done, response, status)
    {
        if (status === 'request-error')
        {
            done(response);
        }
        else
        {
            const _expected = config.expected;
            let _result     = this.check(response.statusCode, _expected.statusCode);
            if (_result === true && 'headers' in _expected)
            {
                const _headers  = _expected.headers;
                const _rheaders = response.headers;
                for (let _header of Object.keys(_headers))
                {
                    _result = this.check(_rheaders[_header], _headers[_header.toLowerCase()]);
                    if (_result !== true)
                    {
                        break;
                    }
                }
            }
            if (_result === true && 'body' in _expected)
            {
                _result = this.check(response.body, _expected.body);
            }
            if (_result === true)
            {
                done();
            }
            else
            {
                done(_result);
            }
        }
    }

    /**
     * Inicia el servidor web a probar.
     *
     * @param {Function} cb Callback a ejecutar cuando el servidor esté listo.
     *
     * @return {ChildProcess}
     */
    static startServer(cb)
    {
        const _serverPath = this.serverPath;
        if (_serverPath)
        {
            const _server = this.server = require('child_process').fork(_serverPath);
            _server.on(
                'message',
                message =>
                {
                    if (message.type === 'ready')
                    {
                        cb();
                    }
                }
            );
        }
        else
        {
            cb();
        }
    }

    /**
     * Detiene el servidor web bajo pruebas.
     */
    static stopServer()
    {
        const _server = this.server;
        if (_server)
        {
            _server.send(
                {
                    options : {
                        timeout : 200
                    },
                    type    : 'stop'
                }
            );
            this.server = null;
        }
    }

    /**
     * @override
     */
    static setUp(done)
    {
        this.startServer(done);
    }

    /**
     * @override
     */
    static tearDown()
    {
        this.stopServer();
    }
}
/**
 * Proceso que tiene el servidor corriendo.
 *
 * @type {null|ChildProcess}
 */
TypeRequest.server = null;
/**
 * Ruta al script que levanta el servidor.
 * Permite usar una nueva instancia del servidor web en cada suite.
 *
 * @type {null|String}
 */
TypeRequest.serverPath = null;
//------------------------------------------------------------------------------
// Exportamos la clase.
//------------------------------------------------------------------------------
module.exports = TypeRequest;
