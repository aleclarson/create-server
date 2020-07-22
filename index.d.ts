import * as http from 'http'
import { Socket } from 'net'
import { TlsOptions } from 'tls'

declare const createServer: {
  (options: ServerOptions & ServerEvents): Server
  (options: ServerOptions, events: ServerEvents): Server
  (port: number, events?: ServerEvents): Server
}

export default createServer

export interface Server extends http.Server {
  url: string
}

export interface ServerOptions extends TlsOptions {
  port?: number
  hostname?: string
  /** Redirect HTTP to HTTPS */
  redirect?: string | number
  /** Listen automatically */
  listen?: boolean
  /** Enable the SPDY protocol */
  spdy?: boolean | ServerEvents['spdy']
  /** Root directory for SSL key/cert path resolution */
  root?: string
}

export interface ServerEvents {
  close?: () => void
  request?: (req: IncomingMessage, res: http.ServerResponse) => void
  listening?: (error?: Error) => void
  upgrade?: (req: IncomingMessage, socket: Socket, head: Buffer) => void
  error?: (error: Error) => void
  http?: () => void
  https?: () => void
  spdy?: () => void
}

export interface IncomingMessage extends http.IncomingMessage {
  url: string
}

export interface ServerResponse extends http.ServerResponse {}
