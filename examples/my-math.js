module.exports = class MyMath {
    constructor(value)
    {
        this.value = value;
    }

    mul(value)
    {
        this.value *= value;
        return this.value;
    }

    sub(value)
    {
        this.value -= value;
        return this.value;
    }

    sum(value)
    {
        this.value += value;
        return this.value;
    }
};
