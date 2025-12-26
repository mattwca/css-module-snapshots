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

/**
 * Unwraps a TryParseResult or throws an error if parsing failed.
 * @param tryParseResult The TryParseResult to unwrap.
 * @param errorMessage Optional custom error message to use if parsing failed.
 * @returns The parsed result if successful.
 * @throws {ParsingError} If parsing failed, with accumulated error messages.
 */
export const unwrapResultOrThrow = <T>(tryParseResult: T | TryParseResult<T>, errorMessage?: string): T => {
  const { result, errors } = unwrapResult(tryParseResult);

  if (result === null || (Array.isArray(result) && result.length === 0)) {
    const errorMessages = errors.map(err => err.message).join('; ');
    throw new ParsingError(errorMessage ?? errorMessages);
  }

  return result;
};
