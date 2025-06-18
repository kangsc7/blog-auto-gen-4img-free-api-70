export interface User {
  id: string;
  password: string;
}

export interface AppState {
  keyword: string;
  topics: string[];
  selectedTopic: string;
  generatedContent: string;
  imagePrompt: string;
  apiKey: string | null;
  isApiKeyValidated: boolean;
  pixabayApiKey: string | null;
  isPixabayApiKeyValidated: boolean;
  huggingFaceApiKey: string | null;
  isHuggingFaceApiKeyValidated: boolean;
  currentUser: string;
  referenceLink?: string;
  referenceSentence?: string;
  colorTheme?: string; // 컬러테마 속성 추가
  preventDuplicates?: boolean;
}

export type UserStatus = 'pending' | 'approved' | 'rejected';
export type AppRole = 'admin' | 'user';

export interface Profile {
  id: string;
  email: string;
  status: UserStatus;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
}
