export interface User {
  id: string;
  password: string;
}

export interface AppState {
  isLoggedIn: boolean;
  currentUser: string;
  apiKey: string;
  isApiKeyValidated: boolean;
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
  saveReferenceTrigger?: boolean;
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
