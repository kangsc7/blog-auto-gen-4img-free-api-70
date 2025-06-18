
export interface AppState {
  apiKey: string;
  pixabayApiKey: string;
  huggingFaceApiKey: string;
  isApiKeyValidated: boolean;
  isPixabayKeyValidated: boolean;
  isHuggingFaceKeyValidated: boolean;
  keyword: string;
  topics: string[];
  selectedTopic: string;
  topicCount: number;
  generatedContent: string;
  imagePrompt: string;
  referenceLink: string;
  referenceSentence: string;
  colorTheme: string;
  preventDuplicates: boolean;
  currentUser: string;
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
