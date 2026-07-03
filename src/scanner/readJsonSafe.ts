export interface JsonParseResult<T> {
  value?: T;
  error?: string;
}

export function readJsonSafe<T = unknown>(text: string): JsonParseResult<T> {
  try {
    return { value: JSON.parse(text) as T };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}
