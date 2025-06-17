
export interface ApiKeyData {
  key: string;
  isValidated: boolean;
  timestamp: number;
  lastValidation: number;
}

export interface AdsenseData {
  code: string;
  isEnabled: boolean;
  client: string;
  slot: string;
  timestamp: number;
}

export interface StoredApiKeys {
  gemini?: ApiKeyData;
  pixabay?: ApiKeyData;
  huggingface?: ApiKeyData;
  adsense?: AdsenseData;
}

const STORAGE_KEY = 'blog_generator_api_keys';

export const loadApiKeys = async (): Promise<StoredApiKeys> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    
    const parsed = JSON.parse(stored);
    console.log('API 키 로드:', parsed);
    return parsed;
  } catch (error) {
    console.error('API 키 로드 오류:', error);
    return {};
  }
};

export const saveApiKeys = async (keys: StoredApiKeys): Promise<void> => {
  try {
    const serialized = JSON.stringify(keys);
    localStorage.setItem(STORAGE_KEY, serialized);
    console.log('API 키 저장 완료:', keys);
  } catch (error) {
    console.error('API 키 저장 오류:', error);
    throw error;
  }
};

export const clearAllApiKeys = async (): Promise<void> => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('모든 API 키 삭제 완료');
  } catch (error) {
    console.error('API 키 삭제 오류:', error);
    throw error;
  }
};

export const saveValidationStatusToStorage = async (
  service: 'gemini' | 'pixabay' | 'huggingface',
  isValidated: boolean
): Promise<void> => {
  try {
    const currentKeys = await loadApiKeys();
    if (currentKeys[service]) {
      currentKeys[service]!.isValidated = isValidated;
      currentKeys[service]!.lastValidation = Date.now();
      await saveApiKeys(currentKeys);
      console.log(`${service} 검증 상태 저장:`, isValidated);
    }
  } catch (error) {
    console.error(`${service} 검증 상태 저장 오류:`, error);
  }
};
