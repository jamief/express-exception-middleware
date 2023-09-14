export interface ResultInterface {
  trimmed?: { start: number, line: number }
  start?: number
  line: number
  column: number
  code: any
  path: any
  at: string
}

export interface OptionsInterface {
  cssFile?: string | null;
  disableSourceMapSupport?: boolean;
  environment?: Record<string, any>;
  enableHeaders?: boolean;
  enableRequest?: boolean;
  idePrefix?: string;
}
