let { fahrenheitToCelsius, celsiusToFahrenheit } = require('../mat');

test('Convert to celsius', () => {
    let fah = fahrenheitToCelsius(32);
    expect(fah).toBe(0);
});

test('Convert to farenheit', () => {
    let cel = celsiusToFahrenheit(0);
    expect(cel).toBe(32);
});