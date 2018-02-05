load('api_config.js');
load('api_rpc.js');
load('api_dht.js');
load('api_timer.js');
load('api_gpio.js');

let t = -99;
let h = -99;
let blink = true;

let led = Cfg.get('pins.led');
GPIO.set_mode(led, GPIO.MODE_OUTPUT);

let sensor = Cfg.get('pins.dht');
let dht = DHT.create(sensor, DHT.DHT22);

let button = Cfg.get('pins.button');
// Publish to MQTT topic on a button press. Button is wired to GPIO pin 0
GPIO.set_button_handler(button, GPIO.PULL_UP, GPIO.INT_EDGE_NEG, 200, function() {
  if (blink) {
    blink = false;
    print('LED blink disabled');
  } else {
    blink = true;
    print('LED blink enabled');
  }
}, null);



// This function reads data from the DHT sensor every 2 second
Timer.set(2000 /* milliseconds */, true /* repeat */, function() {
  if (blink) {
    GPIO.toggle(led);
  }

  t = dht.getTemp();
  h = dht.getHumidity();

  if (isNaN(h) || isNaN(t)) {
    t = -99;
    h = -99
    print('Failed to read data from sensor');
    return;
  }
  print('Temperature:', t, '*C');
  print('Humidity:', h, '%');
}, null);


RPC.addHandler('DHT22.Read', function(args) {
  return { temperature: t, humidity: h };
});

