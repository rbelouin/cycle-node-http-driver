const http = require('http');
const uuidV4 = require('uuid/v4');
const xs = require('xstream').default;

exports.makeHTTPServerDriver = function (port) {
  return function (response$) {
    const responses = {};

    handleEmittedResponses(responses, response$);
    return createRequestStream(responses, port);
  };
};

function handleEmittedResponses (responses, response$) {
  response$.addListener({
    next: response => {
      const res = responses[response.id];

      res.end(response.body);
      delete responses[response.id];
    }
  });
}

function createRequestStream (responses, port) {
  const producer = {
    start: function (listener) {
      this.server = http.createServer(function (req, res) {
        const randomId = uuidV4();

        req.id = randomId;
        responses[randomId] = res;

        listener.next(req);
      });

      this.server.listen(port);
    },
    stop: function () {
      this.server.close();
    }
  };

  return xs.create(producer);
}
