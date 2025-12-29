export interface ChatResponse {
  text: string;
  steps: string[];
}

export interface DocChunk {
  content: string;
  metadata: { filename: string };
  similarity: number;
}