
// API 키 저장소 강화된 관리 시스템
export interface ApiKeyData {
  key: string;
  isValidated: boolean;
  timestamp: number;
  lastValidation: number;
}

export interface StoredApiKeys {
  gemini?: ApiKeyData;
  pixabay?: ApiKeyData;
  huggingface?: ApiKeyData;
  adsense?: {
    code: string;
    isEnabled: boolean;
    timestamp: number;
  };
}

const STORAGE_KEY = 'lovable_api_keys';
const STORAGE_VERSION = '2.0';

// 이중 잠금 메커니즘을 위한 플래그
let isInitializing = false;
let initializationPromise: Promise<StoredApiKeys> | null = null;

// 상세한 로깅 함수
const logStorage = (action: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[API Storage ${timestamp}] ${action}:`, data);
};

// 강화된 데이터 검증
const validateStoredData = (data: any): data is StoredApiKeys => {
  if (!data || typeof data !== 'object') return false;
  
  for (const [service, serviceData] of Object.entries(data)) {
    if (service === 'adsense') {
      if (serviceData && typeof serviceData === 'object') {
        const adsenseData = serviceData as any;
        if (typeof adsenseData.code !== 'string' || 
            typeof adsenseData.isEnabled !== 'boolean' ||
            typeof adsenseData.timestamp !== 'number') {
          logStorage('검증 실패 - 애드센스 데이터 형식 오류', adsenseData);
          return false;
        }
      }
    } else if (serviceData && typeof serviceData === 'object') {
      const keyData = serviceData as ApiKeyData;
      if (typeof keyData.key !== 'string' || 
          typeof keyData.isValidated !== 'boolean' ||
          typeof keyData.timestamp !== 'number' ||
          typeof keyData.lastValidation !== 'number') {
        logStorage('검증 실패 - API 키 데이터 형식 오류', { service, keyData });
        return false;
      }
    }
  }
  
  return true;
};

// 안전한 로컬스토리지 읽기
export const loadApiKeys = async (): Promise<StoredApiKeys> => {
  if (isInitializing && initializationPromise) {
    logStorage('초기화 진행 중 - 기존 Promise 반환');
    return initializationPromise;
  }

  if (isInitializing) {
    logStorage('초기화 진행 중 - 대기');
    return {};
  }

  isInitializing = true;
  
  initializationPromise = new Promise((resolve) => {
    try {
      logStorage('로컬스토리지 읽기 시작');
      const stored = localStorage.getItem(STORAGE_KEY);
      
      if (!stored) {
        logStorage('저장된 데이터 없음 - 기본값 반환');
        resolve({});
        return;
      }

      const parsed = JSON.parse(stored);
      logStorage('저장된 데이터 파싱 완료', parsed);

      if (!validateStoredData(parsed)) {
        logStorage('데이터 검증 실패 - 기본값 반환');
        localStorage.removeItem(STORAGE_KEY);
        resolve({});
        return;
      }

      logStorage('API 키 로드 성공', {
        gemini: parsed.gemini ? '✓' : '✗',
        pixabay: parsed.pixabay ? '✓' : '✗',  
        huggingface: parsed.huggingface ? '✓' : '✗',
        adsense: parsed.adsense ? '✓' : '✗'
      });
      
      resolve(parsed);
    } catch (error) {
      logStorage('로드 중 오류 발생', error);
      localStorage.removeItem(STORAGE_KEY);
      resolve({});
    } finally {
      isInitializing = false;
      initializationPromise = null;
    }
  });

  return initializationPromise;
};

// 안전한 로컬스토리지 저장
export const saveApiKeys = async (keys: StoredApiKeys): Promise<void> => {
  try {
    const dataToSave = {
      ...keys,
      version: STORAGE_VERSION,
      lastUpdated: Date.now()
    };
    
    logStorage('저장 시작', dataToSave);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    logStorage('저장 완료');
  } catch (error) {
    logStorage('저장 중 오류 발생', error);
    throw error;
  }
};

// API 키 저장 (개별)
export const saveApiKey = async (service: 'gemini' | 'pixabay' | 'huggingface', key: string, isValidated: boolean = false): Promise<void> => {
  const currentKeys = await loadApiKeys();
  const now = Date.now();
  
  currentKeys[service] = {
    key,
    isValidated,
    timestamp: now,
    lastValidation: isValidated ? now : 0
  };
  
  await saveApiKeys(currentKeys);
  logStorage(`${service} API 키 저장 완료`, { isValidated });
};

// 애드센스 설정 저장
export const saveAdsenseConfig = async (code: string, isEnabled: boolean): Promise<void> => {
  const currentKeys = await loadApiKeys();
  
  currentKeys.adsense = {
    code,
    isEnabled,
    timestamp: Date.now()
  };
  
  await saveApiKeys(currentKeys);
  logStorage('애드센스 설정 저장 완료', { isEnabled });
};

// API 키 삭제
export const deleteApiKey = async (service: 'gemini' | 'pixabay' | 'huggingface'): Promise<void> => {
  const currentKeys = await loadApiKeys();
  delete currentKeys[service];
  await saveApiKeys(currentKeys);
  logStorage(`${service} API 키 삭제 완료`);
};

// API 키 검증 상태 업데이트
export const updateApiKeyValidation = async (service: 'gemini' | 'pixabay' | 'huggingface', isValidated: boolean): Promise<void> => {
  const currentKeys = await loadApiKeys();
  if (currentKeys[service]) {
    currentKeys[service]!.isValidated = isValidated;
    currentKeys[service]!.lastValidation = Date.now();
    await saveApiKeys(currentKeys);
    logStorage(`${service} API 키 검증 상태 업데이트`, { isValidated });
  }
};

// 검증 상태 저장 (레거시 함수명 지원)
export const saveValidationStatusToStorage = async (service: string, isValidated: boolean): Promise<void> => {
  const serviceMap: { [key: string]: 'gemini' | 'pixabay' | 'huggingface' } = {
    'GEMINI': 'gemini',
    'PIXABAY': 'pixabay', 
    'HUGGING_FACE': 'huggingface'
  };
  
  const mappedService = serviceMap[service];
  if (mappedService) {
    await updateApiKeyValidation(mappedService, isValidated);
  }
};

// 전체 데이터 초기화
export const clearAllApiKeys = async (): Promise<void> => {
  localStorage.removeItem(STORAGE_KEY);
  logStorage('전체 API 키 데이터 초기화 완료');
};
