
export interface User {
  id: string;
  password: string;
}

export interface AppState {
  isLoggedIn: boolean;
  currentUser: string;
  apiKey: string;
  isApiKeyValidated: boolean;
  pixabayApiKey: string;
  isPixabayApiKeyValidated: boolean;
  huggingFaceApiKey: string;
  isHuggingFaceApiKeyValidated: boolean;
  keyword: string;
  topicCount: number;
  topics: string[];
  selectedTopic: string;
  colorTheme: string;
  referenceLink: string;
  referenceSentence: string;
  generatedContent: string;
  imageStyle: string;
  imagePrompt: string;
  generatedImageUrl: string;
  preventDuplicates: boolean;
  saveReferenceTrigger?: boolean;
}

export type UserStatus = 'pending' | 'approved' | 'rejected' | 'expired';
export type AppRole = 'admin' | 'user';

export interface Profile {
  id: string;
  email: string;
  status: UserStatus;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  access_duration_days: number | null;
  remaining_time_seconds: number | null;
  last_time_update: string | null;
}
