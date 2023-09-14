const UNITS: string[] = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

export const humanize = (arg0: number): string => {
  let num: number = arg0

  if (!Number.isFinite(num)) {
    throw new TypeError(`Expected a finite number, got ${typeof num}: ${num}`)
  }

  const neg: boolean = num < 0

  if (neg) {
    num = -num
  }

  if (num < 1) {
    return `${(neg ? '-' : '') + num} B`
  }

  const exponent: number = Math.min(Math.floor(Math.log10(num) / 3), UNITS.length - 1)
  const numStr: string = Number((num / Math.pow(1000, exponent)).toPrecision(3)).toString()
  const unit: string = UNITS[exponent]

  return `${(neg ? '-' : '') + numStr} ${unit}`
}

export const toKeyValueList = (object: Record<string, any>): { key: string; value: string | number }[] => {
  return Object.keys(object)
    .map((key) => ({ key, value: object[key] }))
    .sort((a, b) => a.key.toLowerCase() > b.key.toLowerCase() ? 1 : -1)
}

export function stripProtocol(path: string) {
  const match = path.match(/^(\w+:\/\/).*/) || []

  if (match && match.length) {
    return path.substring(match[1].length)
  }

  return path
}

export function getLastLine(input: string) {
  return input.substring(input.lastIndexOf('\n') + 1, input.length)
}

export function indexOfEndsWith(source: string, sources: string[]) {
  let result = -1

  sources.forEach((s, i) => {
    if (s.endsWith(source)) result = i
  })

  return result
}

const util = {
  getLastLine,
  stripProtocol,
  indexOfEndsWith,
  toKeyValueList,
  humanize
}

export default util
