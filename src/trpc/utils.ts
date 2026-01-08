import { parse, stringify } from 'devalue';

export const transformer = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  deserialize: (object: string) => parse(object),
  serialize: (object: unknown) => stringify(object),
};