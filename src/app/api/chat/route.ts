import { google } from '@ai-sdk/google';
import { ToolLoopAgent, tool, embed } from 'ai';
import { z } from 'zod';
import { supabase, embeddingModel } from '@/lib/ai-logic';

export const maxDuration = 30;

// Define the RAG Agent
const ragAgent = new ToolLoopAgent({
  model: google('gemini-3-flash-preview'),
  instructions: `
    You are the "RAG Control Engine". 
    Style: Cyberpunk, precise, technical.
    Rules:
    1. ALWAYS use the 'searchFiles' tool if the user asks for information.
    2. Cite your sources if you find data.
    3. If no data is found, admit it. Do not hallucinate.
  `,
  tools: {
    searchFiles: tool({
      description: 'Search internal documents for relevant information.',
      inputSchema: z.object({
        query: z.string().describe('The search query or topic to look for in the documents')
      }),
      execute: async ({ query }) => {
        console.log(`🔍 Searching for: "${query}"`);

        if (!query || query.trim().length === 0) {
          console.error('❌ Empty search query received:', query);
          return "Error: No search query provided.";
        }

        try {
          // 1. Convert query to vector
          const { embedding } = await embed({
            model: embeddingModel,
            value: query,
          });

          // 2. Search Supabase
          const { data, error } = await supabase.rpc('match_documents', {
            query_embedding: embedding,
            match_threshold: 0.5,
            match_count: 5,
          });

          if (error) {
            console.error('❌ Supabase search error:', error);
            return `Error searching documents: ${error.message}`;
          }

          // 3. Return results to the Agent
          if (!data || data.length === 0) {
            return "No relevant information found in the documents.";
          }

          console.log(`✅ Found ${data.length} matching documents`);
          return data.map((d: any) => d.content).join('\n\n---\n\n');
        } catch (error: any) {
          console.error('❌ Tool execution error:', error);
          return `Error: ${error.message || 'Unknown error occurred'}`;
        }
      }
    }),
  },
});

// TypeScript interfaces for message formats
interface UIMessagePart {
  type: 'text' | 'text-delta' | 'tool-invocation';
  text?: string;
  delta?: string;
}

interface UIMessage {
  role: string;
  parts?: UIMessagePart[];
  content?: string;
  id?: string;
}

interface CoreMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
}

/**
 * Converts UIMessage format (from @ai-sdk/react) to CoreMessage format (expected by Agent)
 * Handles both legacy content field and new parts array format
 */
function convertUIMessagesToCoreMessages(messages: UIMessage[]): CoreMessage[] {
  return messages.map((msg) => {
    // Ensure role is one of the allowed types
    const role = (msg.role === 'user' || msg.role === 'assistant' || msg.role === 'system' || msg.role === 'tool')
      ? msg.role
      : 'user' as const;

    // If message already has content field, return as-is
    if (msg.content !== undefined) {
      return {
        role,
        content: msg.content
      };
    }

    // Handle UIMessage format with parts array
    if (msg.parts && Array.isArray(msg.parts)) {
      const textParts = msg.parts
        .filter((part) => part.type === 'text' || part.type === 'text-delta')
        .map((part) => part.text || part.delta || '')
        .filter((text) => text.length > 0);

      return {
        role,
        content: textParts.join('\n') || ''
      };
    }

    // Fallback: return with empty content
    return {
      role,
      content: ''
    };
  });
}

export async function POST(req: Request) {
  const { messages } = await req.json();

  console.log("=== INCOMING REQUEST ===");
  console.log("Raw messages:", JSON.stringify(messages, null, 2));

  // Convert UIMessage format to CoreMessage format
  const coreMessages = convertUIMessagesToCoreMessages(messages);
  console.log("Converted messages:", JSON.stringify(coreMessages, null, 2));

  const result = await ragAgent.stream({
    messages: coreMessages as any, // Type assertion needed due to AI SDK internal type complexity
  });

  return result.toUIMessageStreamResponse();
}