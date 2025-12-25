/**
 * Represents a parsing error with a specific message.
 */
export class ParsingError extends Error {
  constructor(message: string, location?: { line: number; column: number }) {
    super(`Parsing Error: ${message}`);
  }
}
