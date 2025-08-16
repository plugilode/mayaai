import { NextRequest, NextResponse } from 'next/server';
import { v0 } from 'v0-sdk';

// Ensure Node.js runtime to allow usage of Buffer and Node APIs
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.V0_API_KEY) {
      return NextResponse.json(
        { error: 'Missing V0_API_KEY. Set it in your environment (.env.local) per the v0 platform demo.' },
        { status: 500 },
      );
    }

    const formData = await request.formData();
    const message = formData.get('message') as string;
    const chatId = formData.get('chatId') as string | undefined;
    const file = formData.get('file') as File | undefined;

    if (!message && !file) {
      return NextResponse.json(
        { error: 'Message or file is required' },
        { status: 400 },
      );
    }

    interface MessagePayload {
      message: string;
      image?: string;
    }

    let chat;
    const messagePayload: MessagePayload = { message };
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      messagePayload.image = buffer.toString('base64');
    }

    if (chatId) {
      // continue existing chat
      chat = await v0.chats.sendMessage({
        chatId: chatId,
        ...messagePayload,
      });
    } else {
      // create new chat
      chat = await v0.chats.create(messagePayload);
    }

    return NextResponse.json({
      id: chat.id,
      demo: chat.demo,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('V0 API Error:', message);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, hasKey: Boolean(process.env.V0_API_KEY) });
}
