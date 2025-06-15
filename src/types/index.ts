
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
