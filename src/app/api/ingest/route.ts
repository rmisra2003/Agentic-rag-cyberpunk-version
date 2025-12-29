import { NextResponse } from 'next/server';
import { embed } from 'ai';
import { supabase, embeddingModel } from '@/lib/ai-logic';
import PDFParser from 'pdf2json';

async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new (PDFParser as any)(null, 1);

    pdfParser.on('pdfParser_dataError', (errData: any) => {
      reject(new Error(errData.parserError));
    });

    pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
      try {
        // Manually extract text from the parsed PDF data
        let text = '';

        if (pdfData.Pages) {
          pdfData.Pages.forEach((page: any) => {
            if (page.Texts) {
              page.Texts.forEach((textItem: any) => {
                if (textItem.R) {
                  textItem.R.forEach((run: any) => {
                    if (run.T) {
                      // Decode URI component with fallback for malformed text
                      try {
                        text += decodeURIComponent(run.T) + ' ';
                      } catch {
                        // If decoding fails, use the raw text
                        text += run.T + ' ';
                      }
                    }
                  });
                }
              });
              text += '\n\n'; // Add paragraph break after each page
            }
          });
        }

        resolve(text.trim());
      } catch (error) {
        reject(error);
      }
    });

    // Parse the PDF buffer
    const buffer = Buffer.from(arrayBuffer);
    pdfParser.parseBuffer(buffer);
  });
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: "No file found" }, { status: 400 });

    let text: string;

    // Handle different file types
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      // Parse PDF
      console.log(`📄 Processing PDF: ${file.name}`);
      const arrayBuffer = await file.arrayBuffer();
      text = await extractTextFromPDF(arrayBuffer);
      console.log(`✅ Extracted text from PDF (${text.length} characters)`);
    } else {
      // Handle text files (.txt, .md, .json)
      text = await file.text();
    }

    // Split by double newline to preserve paragraphs
    const chunks = text.split('\n\n').filter((c) => c.trim().length > 50);

    console.log(`⚡ Processing ${chunks.length} chunks from ${file.name}`);

    const uploadPromises = chunks.map(async (chunk) => {
      try {
        // 1. Generate Embedding (Math)
        const { embedding } = await embed({
          model: embeddingModel,
          value: chunk,
        });

        // 2. Save to Database
        const { error } = await supabase.from('documents').insert({
          content: chunk,
          embedding: embedding,
          metadata: { filename: file.name }
        });

        if (error) {
          console.error('Database insert error:', error);
          throw error;
        }

        return { success: true, chunk };
      } catch (embedError) {
        console.error('Embedding generation error for chunk:', chunk.substring(0, 100) + '...');
        console.error('Embedding error details:', embedError);
        throw embedError;
      }
    });

    await Promise.all(uploadPromises);

    return NextResponse.json({ success: true, count: chunks.length });
  } catch (error) {
    console.error("Ingest Error:", error);
    return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
  }
}