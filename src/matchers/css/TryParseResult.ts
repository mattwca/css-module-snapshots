import { ParsingError } from "./ParsingError";
import { ParsingErrorPosition } from "./types";

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
 * Unwraps a TryParseResult or throws an error with the sum of all accumulated errors, or a custom error message, if parsing failed.
 * @param tryParseResult The TryParseResult to unwrap.
 * @param tokenStream The TokenStream to get the error position from.
 * @param errorMessage Optional custom error message to use if parsing failed.
 * @returns The parsed result if successful.
 * @throws {ParsingError} If parsing failed, with accumulated error messages.
 */
export const unwrapResultOrThrow = <T>(tryParseResult: T | TryParseResult<T>, errorPosition: ParsingErrorPosition, errorMessage?: string): T => {
  const { result, errors } = unwrapResult(tryParseResult);

  if (result === null || (Array.isArray(result) && result.length === 0)) {
    // Combine all error messages into one.
    const errorMessages = errors.map(err => err.message.replace(/Parsing Error: /, '')).join('; ');
    throw new ParsingError(errorMessage ?? errorMessages, errorPosition);
  }

  return result;
};
