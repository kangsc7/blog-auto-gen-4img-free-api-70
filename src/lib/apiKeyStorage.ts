
// API 키 로컬 스토리지 관리
const API_KEY_STORAGE_KEYS = {
  GEMINI: 'gemini_api_key',
  PIXABAY: 'pixabay_api_key',
  HUGGING_FACE: 'hugging_face_api_key',
  GEMINI_VALIDATED: 'gemini_validated',
  PIXABAY_VALIDATED: 'pixabay_validated',
  HUGGING_FACE_VALIDATED: 'hugging_face_validated',
} as const;

export const saveApiKeyToStorage = (keyType: keyof typeof API_KEY_STORAGE_KEYS, value: string) => {
  try {
    localStorage.setItem(API_KEY_STORAGE_KEYS[keyType], value);
    console.log(`${keyType} API 키 로컬 스토리지에 저장됨`);
  } catch (error) {
    console.error(`${keyType} API 키 저장 실패:`, error);
  }
};

export const getApiKeyFromStorage = (keyType: keyof typeof API_KEY_STORAGE_KEYS): string | null => {
  try {
    return localStorage.getItem(API_KEY_STORAGE_KEYS[keyType]);
  } catch (error) {
    console.error(`${keyType} API 키 읽기 실패:`, error);
    return null;
  }
};

export const removeApiKeyFromStorage = (keyType: keyof typeof API_KEY_STORAGE_KEYS) => {
  try {
    localStorage.removeItem(API_KEY_STORAGE_KEYS[keyType]);
    console.log(`${keyType} API 키 로컬 스토리지에서 삭제됨`);
  } catch (error) {
    console.error(`${keyType} API 키 삭제 실패:`, error);
  }
};

export const saveValidationStatusToStorage = (keyType: keyof typeof API_KEY_STORAGE_KEYS, validated: boolean) => {
  try {
    const validationKey = `${keyType}_VALIDATED` as keyof typeof API_KEY_STORAGE_KEYS;
    localStorage.setItem(API_KEY_STORAGE_KEYS[validationKey], validated.toString());
    console.log(`${keyType} 검증 상태 저장됨:`, validated);
  } catch (error) {
    console.error(`${keyType} 검증 상태 저장 실패:`, error);
  }
};

export const getValidationStatusFromStorage = (keyType: keyof typeof API_KEY_STORAGE_KEYS): boolean => {
  try {
    const validationKey = `${keyType}_VALIDATED` as keyof typeof API_KEY_STORAGE_KEYS;
    const stored = localStorage.getItem(API_KEY_STORAGE_KEYS[validationKey]);
    return stored === 'true';
  } catch (error) {
    console.error(`${keyType} 검증 상태 읽기 실패:`, error);
    return false;
  }
};
