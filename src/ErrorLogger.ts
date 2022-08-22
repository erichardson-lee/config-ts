export type ConfigErrorLogger = (msg: string) => void;
export const defaultLogger: ConfigErrorLogger = console.error;
