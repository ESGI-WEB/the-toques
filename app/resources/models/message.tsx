export interface IChatMessage {
    content: string | null;
    role: 'system' | 'user' | 'assistant' | 'function';
}