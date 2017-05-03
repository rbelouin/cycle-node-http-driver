import * as http from 'http';
import uuidV4 from 'uuid/v4';
import xs, { Producer, Stream } from 'xstream';

import { HTTPServerDriver, Options, Request, Response } from './interfaces';

type ResponseStore = Map<String, http.ServerResponse>;

export function makeHTTPServerDriver (port: number, options?: Options): HTTPServerDriver
{
  return function (response$: Stream<Response>): Stream<Request> {
    const responses: ResponseStore = new Map();

    handleEmittedResponses(responses, response$);
    return createRequestStream(responses, port, options);
  };
};

function handleEmittedResponses (responses: ResponseStore, response$: Stream<Response>): void
{
  response$.addListener({
    next: response => {
      const nodeResponse = responses.get(response.id);
      const headers = response.headers || {};

      nodeResponse.statusCode = response.statusCode || 200;
      nodeResponse.statusMessage = response.statusMessage;

      for (let header in headers) {
        nodeResponse.setHeader(header, headers[header]);
      }

      nodeResponse.end(response.body);
      responses.delete(response.id);
    }
  });
}

function createRequestStream (responses: ResponseStore, port: number, options?: Options): Stream<Request>
{
  const producer: Producer<Request> = {
    start: function(listener) {
      this.server = http.createServer(function (nodeRequest, nodeResponse) {
        const randomId: string = uuidV4();
        const chunks: Array<Buffer> = [];

        responses.set(randomId, nodeResponse);

        nodeRequest.on('data', (chunk: Buffer) => chunks.push(chunk));
        nodeRequest.on('end', () => {
          const request: Request = {
            id: randomId,
            method: nodeRequest.method,
            url: nodeRequest.url,
            httpVersion: nodeRequest.httpVersion,
            headers: nodeRequest.headers,
            body: Buffer.concat(chunks).toString()
          };

          listener.next(request);
        });
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
