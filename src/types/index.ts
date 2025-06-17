
export interface AppState {
  keyword: string;
  topics: string[];
  selectedTopic: string;
  generatedContent: string;
  imagePrompt: string;
  apiKey: string;
  isApiKeyValidated: boolean;
  pixabayApiKey: string;
  isPixabayApiKeyValidated: boolean;
  huggingfaceApiKey: string;
  isHuggingfaceApiKeyValidated: boolean;
  colorTheme: string;
  referenceLink: string;
  referenceSentence: string;
  isLoggedIn: boolean;
  currentUser: string;
  preventDuplicates: boolean;
  isGeminiLoading: boolean;
  isPixabayLoading: boolean;
  isHuggingfaceLoading: boolean;
  saveReferenceTrigger: boolean;
  // 애드센스 설정 추가
  adsenseCode: string;
  isAdsenseEnabled: boolean;
}

export interface ColorTheme {
  value: string;
  label: string;
  primary: string;
  secondary: string;
  highlight: string;
  textHighlight: string;
  highlightBorder: string;
  warnBg: string;
  warnBorder: string;
  link: string;
}

export interface UserProfile {
  id: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  expires_at?: string;
}
