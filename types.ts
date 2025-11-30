export enum VoiceName {
  Puck = 'Puck',
  Charon = 'Charon',
  Kore = 'Kore',
  Fenrir = 'Fenrir',
  Zephyr = 'Zephyr'
}

export interface Character {
  id: string;
  name: string;
  description: string;
  voice: VoiceName;
  avatarUrl: string;
  systemInstruction: string;
  color: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  imageUrl?: string; // Optional image URL (base64 or blob)
  audioUrl?: string; // Blob URL for playback
  isAudioLoading?: boolean;
}

export enum AppMode {
  CHAT = 'CHAT',
  TTS = 'TTS'
}