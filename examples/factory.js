module.exports = function factory(test, done, suiteConfig, testConfig)
{
    let _result;
    if (testConfig.name)
    {
        _result = test.check(`Hello ${testConfig.name}`, testConfig.expected);
    }
    else if (Array.isArray(testConfig.params))
    {
        _result = test.check(Math.max(...testConfig.params), testConfig.expected);
    }
    else
    {
        _result = new Error('Unknown option');
    }
    if (_result instanceof Error)
    {
        done(_result);
    }
    else
    {
        done();
    }
};
