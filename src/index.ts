import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import ejs from 'ejs'
import { SourceMapConsumer } from 'source-map'
import type { NextFunction, Request, Response } from 'express'
import util from './util.js'
import type { OptionsInterface, ResultInterface } from './types.js'
import type { SourceMapPayload } from 'node:module'

const TEMPLATE_PATH = path.join(__dirname, './views/error.html')
const template = fs.readFileSync(TEMPLATE_PATH).toString()
const renderTemplate = ejs.compile(template, { delimiter: '?' })
const SOURCEMAP_REGEX = /^\/\/# sourceMappingURL=(.*)$/

function parseSourceMap(input: ResultInterface): ResultInterface {
  const result = { ...input }
  const code = result.code

  const match = util.getLastLine(code).match(SOURCEMAP_REGEX)

  if (match) {
    let sourceMapData: SourceMapPayload
    const dirName = path.dirname(input.path)
    const sourceMapLocation = path.join(dirName, match[1])

    try {
      sourceMapData = JSON.parse(fs.readFileSync(sourceMapLocation) as any)
    } catch (err) {
      console.error([`Unable to locate sourcemap at ${sourceMapLocation}`].join('\n'))
      return result
    }

    const sources = sourceMapData.sources.map(util.stripProtocol)
    const sourceMap = new SourceMapConsumer(sourceMapData)

    const original = (sourceMap as any).originalPositionFor({
      line: input.line,
      column: input.column,
    })

    if (original && original.source) {
      const source = util.stripProtocol(original.source)
      const index = util.indexOfEndsWith(source, sources)

      if (index < 0) {
        console.error(`Can not find source of '${source}' in your sourcemap`)
        return result
      }

      const originalCode = sourceMapData.sourcesContent[index]

      result.code = originalCode
      result.path = original.source
      result.line = original.line
      result.column = original.column
    }
  }

  return result
}

function trimResult(input: ResultInterface): ResultInterface {
  const start = Math.max(input.line - 10, 0)
  const end = input.line + 10

  return {
    ...input,
    trimmed: {
      start: start + 1,
      line: Math.min(input.line, 10)
    },
    code: input.code.split('\n').slice(start, end).join('\n')
  }
}

function parseErrorStack(disableSourceMapSupport: boolean, error: Error) {
  const stack = error.stack.split('\n').slice(1)
  const regex = /at ([\w.]+) \(([^:]+):(\d+):(\d+)\)/

  return stack.map((line) => {
    const match = line.match(regex)

    if (!match) return undefined

    const lineNumber = parseInt(match[3], 10)
    const column = parseInt(match[4], 10)

    const result: ResultInterface = {
      column,
      at: match[1],
      path: match[2],
      line: lineNumber,
      code: ''
    }

    if(fs.existsSync(result.path)) {
      const file = fs.readFileSync(result.path)
      result.code = file.toString()

      return trimResult(disableSourceMapSupport ? result : parseSourceMap(result))
    }
  }).filter(Boolean)
}

class DebuggerUtils {
  
  public config: OptionsInterface

  constructor(config: OptionsInterface) {
    this.config = config
  }

  toKeyValueList(data: any): Record<string, any> {
    return util.toKeyValueList(data)
  }

  getProcessInfo(): any[] {
    return [
      { key: 'platform', value: process.platform },
      { key: 'arch', value: process.arch },
      { key: 'node_version', value: process.version },
      { key: 'cwd', value: process.cwd() },
      { key: 'execPath', value: process.execPath },
      { key: 'pid', value: process.pid },
      { key: 'mainModule', value: require.main.filename },
      {
        key: 'memoryUsage',
        value: util.humanize(process.memoryUsage().heapTotal)
      }
    ]
  }

  getRequestInfo(request: Request): Record<string, any> {
    return this.toKeyValueList({
      path: request.path,
      method: request.method,
      host: request.hostname,
      params: JSON.stringify(request.query)
    })
  }

  getEnvironment(environment: Record<string, any>): Record<string, any> {
    return this.toKeyValueList(environment)
  }

  getUserInfo(user: Express.User): Record<string, any> {     
    return user ? this.toKeyValueList(user) : null
  }
}

export default function main(opts: OptionsInterface, error: Error, req: Request, _res: Response, next: NextFunction) {
  const stack = parseErrorStack(opts.disableSourceMapSupport, error)

  const [errorName, errorMessage, errorStack] = [error.constructor.name, error.message, error.stack]

  const rawError = [`${errorName}: ${errorMessage}`, `${stack.map(t =>`    at ${t.at.trimStart()} (${t.path}:${t.line}:${t.column})`).join('\n')}`]

  const utils = new DebuggerUtils(opts)

  const data = {
    prismJS: fs.readFileSync(path.join(__dirname, './prism/prism.js')),
    config: opts,
    stack,
    errorStack: rawError.join('\n'),
    headers: opts.enableHeaders ? utils.toKeyValueList(req.headers) : false,
    request: opts.enableRequest ? utils.getRequestInfo(req) : false,
    user: req.user ? utils.getUserInfo(req.user) : null,
    environment: utils.getEnvironment(opts.environment ?? process.env),
    proc: utils.getProcessInfo(),
    exception: {
      name: errorName,
      stack: errorStack,
      message: errorMessage
    },
  }

  // console.error(rawError.join('\n'), "\n")
  try {
    return renderTemplate(data)
  } catch(e) {
    console.error(e)
    next(e)
  }
}
