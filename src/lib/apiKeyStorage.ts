
// API 키 로컬 스토리지 관리 - 개선된 버전
const API_KEY_STORAGE_KEYS = {
  GEMINI: 'gemini_api_key',
  PIXABAY: 'pixabay_api_key',
  HUGGING_FACE: 'hugging_face_api_key',
  GEMINI_VALIDATED: 'gemini_validated',
  PIXABAY_VALIDATED: 'pixabay_validated',
  HUGGING_FACE_VALIDATED: 'hugging_face_validated',
  LAST_VALIDATION_TIME: 'last_validation_time',
} as const;

// 검증 상태를 더 안전하게 저장
export const saveApiKeyToStorage = (keyType: keyof typeof API_KEY_STORAGE_KEYS, value: string) => {
  try {
    // 초기화나 로그아웃 시에도 API 키는 유지
    if (value && value.trim()) {
      localStorage.setItem(API_KEY_STORAGE_KEYS[keyType], value);
      localStorage.setItem(API_KEY_STORAGE_KEYS.LAST_VALIDATION_TIME, Date.now().toString());
      console.log(`✅ ${keyType} API 키 영구 저장됨:`, value.substring(0, 20) + '...');
    }
  } catch (error) {
    console.error(`❌ ${keyType} API 키 저장 실패:`, error);
  }
};

export const getApiKeyFromStorage = (keyType: keyof typeof API_KEY_STORAGE_KEYS): string | null => {
  try {
    const value = localStorage.getItem(API_KEY_STORAGE_KEYS[keyType]);
    if (value) {
      console.log(`📖 ${keyType} API 키 로컬 스토리지에서 읽음:`, value.substring(0, 20) + '...');
    }
    return value;
  } catch (error) {
    console.error(`❌ ${keyType} API 키 읽기 실패:`, error);
    return null;
  }
};

export const removeApiKeyFromStorage = (keyType: keyof typeof API_KEY_STORAGE_KEYS) => {
  try {
    localStorage.removeItem(API_KEY_STORAGE_KEYS[keyType]);
    console.log(`🗑️ ${keyType} API 키 로컬 스토리지에서 삭제됨`);
  } catch (error) {
    console.error(`❌ ${keyType} API 키 삭제 실패:`, error);
  }
};

export const saveValidationStatusToStorage = (keyType: keyof typeof API_KEY_STORAGE_KEYS, validated: boolean) => {
  try {
    const validationKey = `${keyType}_VALIDATED` as keyof typeof API_KEY_STORAGE_KEYS;
    // 검증 상태도 영구 저장
    localStorage.setItem(API_KEY_STORAGE_KEYS[validationKey], validated.toString());
    localStorage.setItem(API_KEY_STORAGE_KEYS.LAST_VALIDATION_TIME, Date.now().toString());
    console.log(`✅ ${keyType} 검증 상태 영구 저장됨:`, validated, '시간:', new Date().toLocaleTimeString());
  } catch (error) {
    console.error(`❌ ${keyType} 검증 상태 저장 실패:`, error);
  }
};

export const getValidationStatusFromStorage = (keyType: keyof typeof API_KEY_STORAGE_KEYS): boolean => {
  try {
    const validationKey = `${keyType}_VALIDATED` as keyof typeof API_KEY_STORAGE_KEYS;
    const stored = localStorage.getItem(API_KEY_STORAGE_KEYS[validationKey]);
    const result = stored === 'true';
    console.log(`📖 ${keyType} 검증 상태 읽음:`, result);
    return result;
  } catch (error) {
    console.error(`❌ ${keyType} 검증 상태 읽기 실패:`, error);
    return false;
  }
};

// 모든 API 키와 검증 상태를 한번에 가져오는 함수
export const getAllApiKeysFromStorage = () => {
  const geminiKey = getApiKeyFromStorage('GEMINI');
  const pixabayKey = getApiKeyFromStorage('PIXABAY');
  const huggingFaceKey = getApiKeyFromStorage('HUGGING_FACE');
  
  const geminiValidated = getValidationStatusFromStorage('GEMINI');
  const pixabayValidated = getValidationStatusFromStorage('PIXABAY');
  const huggingFaceValidated = getValidationStatusFromStorage('HUGGING_FACE');
  
  const lastValidationTime = localStorage.getItem(API_KEY_STORAGE_KEYS.LAST_VALIDATION_TIME);
  
  console.log('🔄 모든 API 키 상태 로드 (영구 저장):', {
    gemini: { key: geminiKey?.substring(0, 20) + '...', validated: geminiValidated },
    pixabay: { key: pixabayKey?.substring(0, 20) + '...', validated: pixabayValidated },
    huggingface: { key: huggingFaceKey?.substring(0, 20) + '...', validated: huggingFaceValidated },
    lastValidated: lastValidationTime ? new Date(parseInt(lastValidationTime)).toLocaleString() : 'Never'
  });
  
  return {
    geminiKey,
    pixabayKey,
    huggingFaceKey,
    geminiValidated,
    pixabayValidated,
    huggingFaceValidated,
    lastValidationTime
  };
};

// 초기화 시에도 API 키는 보존하는 함수
export const preserveApiKeysOnReset = () => {
  console.log('🔐 초기화 시 API 키 상태 보존');
  // API 키들은 그대로 유지하고 검증 상태만 확인
  const allKeys = getAllApiKeysFromStorage();
  return allKeys;
};
