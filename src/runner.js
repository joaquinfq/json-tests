const jfFileSystem = require('jf-file-system').i();
const jfJsonParse  = require('jf-json-parse');
const chalk        = require('chalk');
const path         = require('path');
/**
 * Caché de archivos JSON leídos al resolver las inclusiones.
 *
 * @type {Object}
 */
const cache        = {};
/**
 * Clase encargada de cargar los archivos y generar las pruebas a partir
 * de los archivos JSON encontrados en los directorios especificados.
 *
 * @class Runner
 */
module.exports = class Runner {
    /**
     * Constructor de la clase.
     *
     * @param {String[]} directories Directorios donde se buscarán los archivos JSON.
     */
    constructor(directories)
    {
        /**
         * Listado de archivos JSON encontrados.
         *
         * @type {String[]}
         */
        this.files = [];
        /**
         * Directorio raíz de las pruebas.
         * Se usa para acortar los nombres de archivos.
         *
         * @type {String}
         */
        this.rootdir = __dirname;
        //------------------------------------------------------------------------------
        this.loadDirectories(directories);
    }

    /**
     * Agrega las pruebas existentes en un archivo JSON.
     *
     * @param {String} filename Ruta al archivo JSON.
     */
    addTests(filename)
    {
        const _config  = jfJsonParse(filename, cache);
        let _testClass = _config.factory
            ? 'factory'
            : _config.class
                             ? 'class'
                             : 'request';
        const _test    = new (require('./type/' + _testClass))(
            Object.assign(
                _config,
                {
                    __dirname  : path.dirname(filename),
                    __filename : filename,
                    __rootDir  : this.rootdir
                }
            )
        );
        _test.configure();
    }

    /**
     * Busca en los directorios especificados los archivos JSON con las definiciones
     * de las pruebas.
     *
     * @param {String[]} directories Directorios donde se buscarán los archivos JSON.
     */
    loadDirectories(directories)
    {
        if (Array.isArray(directories))
        {
            const _files = [];
            const _sep   = path.sep;
            let _subdirs = directories[0].split(_sep);
            directories.forEach(
                (dir, index) =>
                {
                    _files.push(...jfFileSystem.scandir(dir, /\.json$/));
                    if (index > 0)
                    {
                        let _count = 0;
                        for (let _subdir of dir.split(_sep))
                        {
                            if (_subdirs[_count] === _subdir)
                            {
                                ++_count;
                            }
                            else
                            {
                                break;
                            }
                        }
                        _subdirs = _subdirs.slice(0, _count);
                    }
                }
            );
            this.files   = _files.sort();
            this.rootdir = _subdirs.join(_sep);
        }
    }

    /**
     * Genera las pruebas a partir de los archivos JSON encontrados.
     */
    run()
    {
        this.files.forEach(filename => this.addTests(filename));
    }
};
if (typeof describe === 'undefined' || typeof it === 'undefined')
{
    console.log(
        '%s JSON Tests needs %s (%s, %s, %s, %s) functions!!!',
        chalk.red('ERROR:'),
        chalk.magenta('mocha'),
        chalk.yellow('describe'),
        chalk.yellow('it'),
        chalk.yellow('after'),
        chalk.yellow('before')
    );
}
