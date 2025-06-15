export interface User {
  id: string;
  password?: string;
}

export interface AppState {
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
  saveReferenceTrigger: boolean;
}

export type Profile = {
  id: string;
  email: string | null;
  status: "pending" | "approved" | "rejected";
  role: "admin" | "user";
  created_at: string;
  updated_at: string;
};
