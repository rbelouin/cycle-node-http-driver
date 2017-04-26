# cycle-node-http-driver

A server HTTP driver for Cycle.js

## Basic usage

```js
const run = require('@cycle/run').default;
const makeHTTPServerDriver = require('cycle-node-http-driver').makeHTTPServerDriver;

function main({ HTTPServer }) {
  // Get the request from the HTTPServer source
  const request$ = HTTPServer;

  // Build a stream containing your HTTP responses
  const response$ = request$.map(request => ({
    id: request.id, // Don't forget to forward the request id
    statusCode: 200,
    statusMessage: 'OK',
    headers: {
      'Content-Type': 'text/html'
    },
    body: '<h1>Hello, world!</h1>'
  }));

  // Pass your stream to the HTTPServer sink
  return {
    HTTPServer: response$
  };
}

const drivers = {
  HTTPServer: makeHTTPServerDriver(8080) // The driver will create a HTTP server listening on 0.0.0.0:8080
};

run(main, drivers);
```
