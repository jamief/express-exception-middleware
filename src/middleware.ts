import type { NextFunction, Request, Response } from 'express'
import type { OptionsInterface } from './types.js'
import main from './index.js'

export default function debugMiddleware(options?: OptionsInterface) {
  const defaultOptions: OptionsInterface = {
    cssFile: null,
    disableSourceMapSupport: false,
    environment: process.env,
    enableHeaders: true,
    enableRequest: true,
    idePrefix: ''
  }

  const opts = Object.assign({}, defaultOptions, options)

  return function (error: Error, req: Request, res: Response, next: NextFunction) {
    const html = main(opts, error, req, res, next)
    res.status(500).send(html).end()
  }
}
