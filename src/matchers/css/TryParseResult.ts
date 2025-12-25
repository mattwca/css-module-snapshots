import { ParsingError } from "./ParsingError";

/**
 * Represents the result of a try-parse operation, including any errors encountered, and the parsed result if successful.
 */
export type TryParseResult<T> = {
  errors: ParsingError[];
  result: T | null;
}

/**
 * Type guard to check if an object is a TryParseResult.
 */
export const isTryParseResult = <T>(obj: any): obj is TryParseResult<T> => {
  return obj && typeof obj === 'object' && 'errors' in obj && 'result' in obj;
};

/**
 * Unwraps a TryParseResult, returning a consistent structure.
 */
export const unwrapResult = <T>(tryParseResult: T | TryParseResult<T>): TryParseResult<T> => {
  let result: T | null, errors: ParsingError[];

  if (isTryParseResult(tryParseResult)) {
    result = tryParseResult.result;
    errors = tryParseResult.errors;
  } else {
    result = tryParseResult as T;
    errors = [];
  }

  return { result, errors };
};
