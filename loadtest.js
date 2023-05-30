const loadtest = require('loadtest');

let options = {
    url: 'https://dev.api.sensor.anablepsecurity.com/sensor/motion',
    requestsPerSecond: 10000,
    maxSeconds: 60,
    method: 'POST',
    requestGenerator: (params, options, client, callback) => {
        const message = JSON.stringify({
            "macId": `test-${Math.random()}`,
            "status": [1,2,3].sample()
        })
        options.headers['Content-Length'] = message.length;
        options.headers['Content-Type'] = 'application/json';
        options.body = message;
        const request = client(options, callback);
        request.write(message);
        return request;
    }
}
Array.prototype.sample = function(){
    return this[Math.floor(Math.random()*this.length)];
  }

loadtest.loadTest(options, (error, results) => {
    if (error) {
        return console.error('Got an error: %s', error);
    }
    console.log(results);
    console.log('Tests run successfully');
});

