const os = require('os');
const Gpio = require('pigpio').Gpio;
const mqtt = require('mqtt');
const config = require('./config.json');

const pin = new Gpio(19, {mode: Gpio.OUTPUT});
const hostname = os.hostname();

const client = mqtt.connect({
    servers: [{
        host: config.brokerAddress,
        port: config.brokerPort || 1883,
    }],
    clientId: config.clientId || 'hyperpixel-brightness-control',
    clean: config.clean || true,
});

client.subscribe([config.topic, `${config.topic}/${hostname}`], {
    qos: 2,
});

client.on('connect', () => console.log(`Connected to ${config.brokerAddress}!`));

client.on('error', (err) => console.error(err));

client.on('message', (topic, message) => {
    console.debug(`Message received on topic ${topic}: ${message.toString()}`);

    try {
        const json = JSON.parse(message.toString());

        const frequency = json.frequency
            ? json.frequency
            : config.frequency
                ? config.frequency
                : 8000;

        if (json.is_on === true || json.brightness) {
            const brightness = json.brightness
                ? json.brightness
                : config.brightness;

            console.debug(`Turning display on with frequency ${frequency} and duty cycle ${brightness}`);

            pin.hardwarePwmWrite(frequency, brightness);
        }

        if (json.is_on === false) {
            console.debug(`Turning display off`);

            pin.hardwarePwmWrite(frequency, 0);
        }
    } catch (err) {
        console.error('Error parsing JSON', err);
    }
});
