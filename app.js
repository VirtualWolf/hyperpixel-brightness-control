const Gpio = require('pigpio').Gpio;
const mqtt = require('mqtt');
const config = require('./config.json');

const pin = new Gpio(19, {mode: Gpio.OUTPUT});

const client = mqtt.connect({
    servers: [{
        host: config.brokerAddress,
        port: config.brokerPort || 1883,
    }],
    clientId: config.clientId || 'hyperpixel-brightness-control',
    clean: config.clean || true,
});

client.subscribe(config.topic, {
    qos: 2,
});

client.on('connect', () => console.log(`Connected to ${config.brokerAddress}!`));

client.on('error', (err) => console.error(err));

client.on('message', (topic, message) => {
    console.debug(`Message received on topic ${topic}: ${message.toString()}`);

    try {
        const json = JSON.parse(message.toString());

        if (json.is_on === true) {
            console.debug(`Turning display on with duty cycle ${config.brightness}`);

            pin.hardwarePwmWrite(1000000, config.brightness);
        }

        if (json.is_on === false) {
            console.debug(`Turning display off`);

            pin.hardwarePwmWrite(1000000, 0);
        }
    } catch (err) {
        console.error('Error parsing JSON', err);
    }
});
