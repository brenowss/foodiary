import OpenAI, { toFile } from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function transcribeAudio(file: Buffer) {
  const text = await client.audio.transcriptions.create({
    file: await toFile(file, 'audio.m4a', {
      type: 'audio/m4a',
    }),
    model: 'whisper-1',
    language: 'pt-BR',
    response_format: 'text',
  });

  return text;
}
