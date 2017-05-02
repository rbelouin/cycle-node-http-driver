const assert = require('assert');
const http = require('http');

const run = require('@cycle/run').default;
const makeHTTPServerDriver = require('./dist/index').makeHTTPServerDriver;

describe('makeHTTPServerDriver', function() {
  it('should start a server and send the right responses', function(done) {
    const port = 8080;
    const statusCode = 299;
    const statusMessage = 'Custom Response';
    const headers = {
      'Content-Type': 'text/html',
      'Custom-Header': 'Custom Value'
    };
    const body = '<h1>Hello, world!</h1>';

    function main({ HTTPServer }) {
      const request$ = HTTPServer;
      const response$ = request$.map(request => ({ id: request.id, statusCode, statusMessage, headers, body }));

      return {
        HTTPServer: response$
      };
    }

    const drivers = {
      HTTPServer: makeHTTPServerDriver(port, {
        keepAlive: 100
      })
    };

    run(main, drivers);

    const requestOptions = {
      host: '127.0.0.1',
      port
    };

    const req = http.request(requestOptions, function (res) {
      assert.equal(res.statusCode, statusCode, 'Status code should be as expected');
      assert.equal(res.statusMessage, statusMessage, 'Status message should be as expected');

      for (header in headers) {
        assert.equal(res.headers[header.toLowerCase()], headers[header], `Header (${header}) should be as expected`);
      }

      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const actualBody = Buffer.concat(chunks).toString('utf-8');
        assert.equal(actualBody, body);

        done();
      });
    });

    req.end();
  });
});
