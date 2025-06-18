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
}
