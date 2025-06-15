
import React from 'react';
import { ApiKeyManager } from '@/components/control/ApiKeyManager';
import { PixabayApiKeyManager } from '@/components/control/PixabayApiKeyManager';
import { AppState } from '@/types';
import { usePixabayManager } from '@/hooks/usePixabayManager';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Settings, ImagePlus } from 'lucide-react';

interface ApiKeysSectionProps {
    appState: AppState;
    saveAppState: (newState: Partial<AppState>) => void;
    isValidatingApi: boolean;
    validateApiKey: () => Promise<boolean>;
    saveApiKeyToStorage: () => void;
    deleteApiKeyFromStorage: () => void;
    pixabayManager: ReturnType<typeof usePixabayManager>;
}

const PlaceholderCard = ({ title, icon: Icon }: { title: string, icon: React.ElementType }) => (
    <Card className="shadow-md flex flex-col items-center justify-center h-48 cursor-pointer bg-gray-50/50 hover:bg-gray-50 border-2 border-dashed border-gray-200">
        <div className="text-center text-gray-500">
            <Icon className="h-10 w-10 mx-auto mb-3 text-gray-400" />
            <p className="text-lg font-semibold text-gray-600">{title}</p>
            <p className="text-xs mt-1">마우스를 올리면 설정이 나타납니다.</p>
        </div>
    </Card>
);

const HoverContainer = ({ placeholder, children }: { placeholder: React.ReactNode, children: React.ReactNode }) => {
    const [isHovered, setIsHovered] = React.useState(false);
    
    // The height of the container is set to be tall enough to fit the tallest of the two API manager cards.
    // This prevents layout shifts when hovering.
    const containerHeight = '280px'; 

    return (
        <div onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} className="relative" style={{ height: containerHeight }}>
            <AnimatePresence>
                {!isHovered && (
                    <motion.div
                        className="absolute inset-0"
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    >
                        {placeholder}
                    </motion.div>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        className="absolute inset-0"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1, transition: { duration: 0.2, ease: 'easeOut' } }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15, ease: 'easeIn' } }}
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export const ApiKeysSection: React.FC<ApiKeysSectionProps> = ({
    appState,
    saveAppState,
    isValidatingApi,
    validateApiKey,
    saveApiKeyToStorage,
    deleteApiKeyFromStorage,
    pixabayManager,
}) => {
    return (
        <div className="max-w-7xl mx-auto my-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HoverContainer
                placeholder={<PlaceholderCard title="API 키 설정" icon={Settings} />}
            >
                <ApiKeyManager
                    appState={appState}
                    saveAppState={saveAppState}
                    isValidatingApi={isValidatingApi}
                    validateApiKey={validateApiKey}
                    saveApiKeyToStorage={saveApiKeyToStorage}
                    deleteApiKeyFromStorage={deleteApiKeyFromStorage}
                />
            </HoverContainer>
            <HoverContainer
                placeholder={<PlaceholderCard title="Pixabay API 키 설정" icon={ImagePlus} />}
            >
                <PixabayApiKeyManager
                    apiKey={pixabayManager.pixabayApiKey}
                    setApiKey={pixabayManager.setPixabayApiKey}
                    isValidated={pixabayManager.isPixabayApiKeyValidated}
                    isValidating={pixabayManager.isPixabayValidating}
                    validateApiKey={pixabayManager.validatePixabayApiKey}
                    saveApiKey={pixabayManager.savePixabayApiKeyToStorage}
                    deleteApiKey={pixabayManager.deletePixabayApiKeyFromStorage}
                />
            </HoverContainer>
        </div>
    );
};
