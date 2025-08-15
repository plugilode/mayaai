import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json(
        { error: 'Missing GOOGLE_GENERATIVE_AI_API_KEY. Add it to .env.local' },
        { status: 500 },
      );
    }

    const formData = await request.formData();
    const message = (formData.get('message') as string | null)?.trim();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(message);
    const text = result.response.text();
    if (!text) {
      throw new Error('Empty response from Gemini API');
    }
    return NextResponse.json({ content: text });
  } catch (err: any) {
    console.error('Gemini API Error:', err?.message || err);
    return NextResponse.json({ error: 'Failed to process Gemini request' }, { status: 500 });
  }
}
