import * as http from 'http'
import { Socket } from 'net'
import { TlsOptions } from 'tls'

declare const createServer: {
  (options: ServerOptions & ServerEvents): http.Server
  (options: ServerOptions, events: ServerEvents): http.Server
  (port: number, events?: ServerEvents): http.Server
}

export default createServer

export interface ServerOptions extends TlsOptions {
  port?: number
  hostname?: string
  /** Redirect HTTP to HTTPS */
  redirect?: string | number
  /** Listen automatically */
  listen?: boolean
  /** Enable the SPDY protocol */
  spdy?: true
  /** Root directory for SSL key/cert path resolution */
  root?: string
}

export interface ServerEvents {
  close?: () => void
  request?: (req: http.IncomingMessage, res: http.ServerResponse) => void
  listening?: (error?: Error) => void
  upgrade?: (
    response: http.IncomingMessage,
    socket: Socket,
    head: Buffer
  ) => void
  error?: (error: Error) => void
  http?: () => void
  https?: () => void
  spdy?: () => void
}
