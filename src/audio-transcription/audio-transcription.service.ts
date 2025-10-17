import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class AudioTranscriptionService {
  private readonly logger = new Logger(AudioTranscriptionService.name);
  private readonly openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async transcribeFromUrl(audioUrl) {
    // 1️⃣ Fetch the audio from the remote URL
    const response = await fetch(audioUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2️⃣ Send it directly to OpenAI without saving
    const transcription = await this.openai.audio.transcriptions.create({
      file: new File([buffer], 'audio.mp3', { type: 'audio/mpeg' }),
      model: 'gpt-4o-mini-transcribe', // or "whisper-1"
    });
    console.log('Transcription:', transcription.text);
    return {
      transcribed: transcription.text,
      normalizedText: this.normalizeAcronym(transcription.text),
    };
  }

  private normalizeAcronym(text: string) {
    if (!text || typeof text !== 'string') return '';
    return text
      .toUpperCase() // Always uppercase
      .replace(/[^A-Z0-9]/g, ''); // Remove anything that's not a letter or number
  }
}
