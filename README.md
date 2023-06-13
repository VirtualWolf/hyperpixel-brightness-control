# hyperpixel-brightness-control

This is a very simple Node.js app to listen to an MQTT topic and either turn on or off an attached [Pimoroni HyperPixel 4 TFT display](https://shop.pimoroni.com/products/hyperpixel-4?variant=12569539706963) attached to a Raspberry Pi. I use it in combination with my [pi-home-dashboard](https://github.com/VirtualWolf/pi-home-dashboard) service that publishes messages to the topic that the `hyperpixel-brightness-control` app listens on, primarily so I can turn the HyperPixel display off at night when it's bed time.

It requires a file in the root of the directory called `config.json` with the following content:

```json
{
    "brokerAddress": "<MQTT_BROKER_ADDRESS>",
    "clientId": "<MQTT_CLIENT_ID_TO_CONNECT_AS>",
    "clean": false,
    "topic": "<MQTT_TOPIC_TO_LISTEN_FOR_MESSAGES_ON>",
    "brightness": <BRIGHTNESS_VALUE>
}
```

The expected MQTT topic payload looks like this, with `brightness` being optional (if not sent in the message, it will fall back to the brightness configured in `config.json`):

```json
{
    "is_on": <boolean>,
    "brightness": <number>
}
```

## Notes
* The `brightness` value in the configuration file and the MQTT payload is the brightness that will be set when the display is on. Values seem to vary even between HyperPixels panels, on one of mine 130000 is a decent brightness without being eye-searing, but on the other anything below 145000 will turn the display entirely off. You may need to experiment.
* I recommend using [PM2](https://pm2.keymetrics.io) to keep the app running and to start it at boot.
* Because this talks to the GPIO ports directly by way of the [pigpio](https://github.com/fivdi/pigpio), it _must_ be run as root.
