
export type UserStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export interface Profile {
  id: string;
  email: string | null;
  status: UserStatus;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  access_expires_at: string | null;
  remaining_access_days: number | null;
}

export interface AppState {
  currentUser: string;
  keyword: string;
  topics: string[];
  selectedTopic: string;
  generatedContent: string;
  apiKey: string | null;
  isApiKeyValidated: boolean;
  imagePrompt: string;
  pixabayApiKey: string | null;
  isPixabayApiKeyValidated: boolean;
  huggingFaceApiKey: string | null;
  isHuggingFaceApiKeyValidated: boolean;
  colorTheme: string;
  referenceLink: string;
  referenceSentence: string;
  preventDuplicates: boolean;
}
