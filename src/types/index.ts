export interface User {
  id: string;
  password: string;
}

export interface AppState {
  keyword: string;
  topics: string[];
  selectedTopic: string;
  topicCount: number;
  generatedContent: string;
  isApiKeyValidated: boolean;
  apiKey: string;
  pixabayApiKey: string;
  isPixabayApiKeyValidated: boolean;
  huggingFaceApiKey: string;
  isHuggingFaceApiKeyValidated: boolean;
  imagePrompt: string;
  generatedImageUrl: string;
  isLoggedIn: boolean;
  currentUser: string;
  colorTheme: string;
  referenceLink: string;
  referenceSentence: string;
  imageStyle: string;
  preventDuplicates: boolean;
  saveReferenceTrigger?: boolean;
  adSenseSettings?: {
    enabled: boolean;
    adClient: string;
    adSlot: string;
    adCount: number;
  };
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
