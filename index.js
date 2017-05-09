/**
 * Permite ejecutar un listado de pruebas en archivos JSON que se encuentran en:
 *
 * - El directorio `test` y/o `tests` del directorio actual.
 * - Directorios que contienen los archivos `.json` y que son especificados
 *   usando la opción `--json-tests-dir=/path/json-tests-dir`.
 *
 * Uso:
 *
 * $ /path/to/mocha /path/to/json-tests/index.js [--directory=/path/to/dir]
 */
//------------------------------------------------------------------------------
/**
 * Permite especifica un directorio que será agregado al runner:
 *
 * @const {String}
 */
const OPTION   = '--json-tests-dir=';
const cwd      = process.cwd();
const fs       = require('fs');
const length   = OPTION.length;
const pathJoin = require('path').join;
//------------------------------------------------------------------------------
// Inicio del script
//------------------------------------------------------------------------------
const dirs     = [
    pathJoin(cwd, 'test'),
    pathJoin(cwd, 'tests'),
    ...process.argv.map(
        option => option.substr(0, length) === OPTION
            ? option.substr(length)
            : false
    )
]
    .filter(dir => !!dir && fs.existsSync(dir));
if (dirs.length)
{
    const Runner = require('./src/runner');
    const runner = new Runner(dirs);
    runner.run();
}
else
{
    console.log('No se han especificado directorios (--directory=/path/to/tests)');
}
