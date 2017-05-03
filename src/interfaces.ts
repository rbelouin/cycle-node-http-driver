import { Stream } from 'xstream';

export type HTTPServerDriver = (r$: Stream<Response>) => Stream<Request>;

export type Options = {
  keepAlive?: number
};

export interface Request {
  id: string,
  method: string,
  url: string,
  httpVersion: string,
  headers: {
    [name: string]: string
  },
  body: string
}

export interface Response {
  id: string,
  statusCode?: number,
  statusMessage?: string,
  headers?: {
    [name: string]: string
  },
  body?: string
};
