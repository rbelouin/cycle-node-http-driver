const run = require('@cycle/run').default;
const makeHTTPServerDriver = require('./index').makeHTTPServerDriver;

function main({ HTTPServer }) {
  const request$ = HTTPServer;
  const response$ = request$.map(request => ({
    id: request.id,
    statusCode: 299,
    statusMessage: 'Custom Response',
    headers: {
      'Content-Type': 'text/html',
      'Custom-Header': 'Custom Value'
    },
    body: `
      <h1>Hello, world!</h1>
    `
  }));

  return {
    HTTPServer: response$
  };
}

const drivers = {
  HTTPServer: makeHTTPServerDriver(8080, {
    keepAlive: 1000
  })
};

run(main, drivers);
