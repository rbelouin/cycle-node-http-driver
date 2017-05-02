import * as http from 'http';
import uuidV4 from 'uuid/v4';
import xs from 'xstream';

export function makeHTTPServerDriver (port, options) {
  return function (response$) {
    const responses = {};

    handleEmittedResponses(responses, response$);
    return createRequestStream(responses, port, options);
  };
};

function handleEmittedResponses (responses, response$) {
  response$.addListener({
    next: response => {
      const res = responses[response.id];
      const headers = response.headers || {};

      res.statusCode = response.statusCode || 200;
      res.statusMessage = response.statusMessage;

      for (let header in headers) {
        res.setHeader(header, headers[header]);
      }

      res.end(response.body);
      delete responses[response.id];
    }
  });
}

function createRequestStream (responses, port, options) {
  const producer = {
    start: function (listener) {
      this.server = http.createServer(function (req, res) {
        const randomId = uuidV4();
        const request = Object.assign({}, req, {id: randomId});

        responses[randomId] = res;

        listener.next(request);
      });

      if (options && options.keepAlive) {
        this.server.addListener('connection', function(stream) {
          stream.setTimeout(options.keepAlive);
        });
      }

      this.server.listen(port);
    },
    stop: function () {
      this.server.close();
    }
  };

  return xs.create(producer);
}
