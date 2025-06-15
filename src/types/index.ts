
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
  generatedContent: string;
  imageStyle: string;
  imagePrompt: string;
}
