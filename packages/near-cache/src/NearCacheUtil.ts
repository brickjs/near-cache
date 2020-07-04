import stringify from 'json-stable-stringify';

export const createCacheKey = (args: IArguments): string => {
  if (args.length === 0) return '';

  if (args.length === 1) {
    const firstArg = args[0];
    if (firstArg === undefined) return 'undefined';
    if (firstArg === null) return 'null';
    if (typeof firstArg === 'number') return `${firstArg}`;
    if (typeof firstArg === 'string') return firstArg;
    if (typeof firstArg === 'boolean') return firstArg === true ? 'true' : 'false';
  }

  const argsString = stringify(args);
  const buff = Buffer.from(argsString);
  const argsKey = buff.toString('base64');

  return argsKey;
};
