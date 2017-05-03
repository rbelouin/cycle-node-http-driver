import * as assert from 'assert';
import * as http from 'http';

import { run } from '@cycle/run';
import { makeHTTPServerDriver } from '../src/index';

interface IncomingMessageWithBody extends http.IncomingMessage {
  body: string
}

describe('makeHTTPServerDriver', function() {
  it('should start a server and send the right responses', function() {
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

    const stop = run(main, drivers);

    const responsePromise: Promise<IncomingMessageWithBody> = sendRequest({
      host: '127.0.0.1',
      port
    });

    return responsePromise.then(res => {
      assert.equal(res.statusCode, statusCode, 'Status code should be as expected');
      assert.equal(res.statusMessage, statusMessage, 'Status message should be as expected');

      for (let header in headers) {
        assert.equal(res.headers[header.toLowerCase()], headers[header], `Header (${header}) should be as expected`);
      }

      assert.equal(res.body, body);
      stop();
    });
  });
});

function sendRequest(options: http.RequestOptions) {
  return new Promise<IncomingMessageWithBody>(function(resolve, reject) {
    const req: http.ClientRequest = http.request(options, function(res) {
      const chunks: Array<Buffer> = [];

      res.on('data', (chunk: Buffer) => chunks.push(chunk));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString();
        resolve(Object.assign({}, res, { body }));
      });
    });

    req.end();
  });
}
