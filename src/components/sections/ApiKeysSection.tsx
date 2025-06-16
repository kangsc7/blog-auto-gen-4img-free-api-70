
import React from 'react';
import { ApiKeyManager } from '@/components/control/ApiKeyManager';
import { PixabayApiKeyManager } from '@/components/control/PixabayApiKeyManager';
import { HuggingFaceApiKeyManager } from '@/components/control/HuggingFaceApiKeyManager';
import { AppState } from '@/types';
import { usePixabayManager } from '@/hooks/usePixabayManager';
import { useHuggingFaceManager } from '@/hooks/useHuggingFaceManager';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Settings, ImagePlus, Bot } from 'lucide-react';

interface ApiKeysSectionProps {
    appState: AppState;
    saveAppState: (newState: Partial<AppState>) => void;
    isValidatingApi: boolean;
    validateApiKey: () => Promise<boolean>;
    deleteApiKeyFromStorage: () => void;
    pixabayManager: ReturnType<typeof usePixabayManager>;
    huggingFaceManager: ReturnType<typeof useHuggingFaceManager>;
}

const CompactCard = ({ title, icon: Icon }: { title: string, icon: React.ElementType }) => (
    <Card className="shadow-md flex items-center justify-center h-16 cursor-pointer bg-gray-50/50 hover:bg-gray-50 border-2 border-dashed border-gray-200">
        <div className="flex items-center text-gray-500 px-4">
            <Icon className="h-5 w-5 mr-2 text-gray-400" />
            <p className="text-sm font-semibold text-gray-600">{title}</p>
        </div>
    </Card>
);

const HoverExpandContainer = ({ compactView, expandedView }: { compactView: React.ReactNode, expandedView: React.ReactNode }) => {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
        <div onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} className="relative">
            <AnimatePresence>
                {!isHovered && (
                    <motion.div
                        className="absolute inset-0"
                        initial={{ opacity: 1, height: 'auto' }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0, transition: { duration: 0.15 } }}
                    >
                        {compactView}
                    </motion.div>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        className="absolute inset-0 z-10"
                        initial={{ opacity: 0, scale: 0.95, height: 'auto' }}
                        animate={{ opacity: 1, scale: 1, height: 'auto', transition: { duration: 0.2, ease: 'easeOut' } }}
                        exit={{ opacity: 0, scale: 0.95, height: 'auto', transition: { duration: 0.15, ease: 'easeIn' } }}
                    >
                        {expandedView}
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
    deleteApiKeyFromStorage,
    pixabayManager,
    huggingFaceManager,
}) => {
    return (
        <div className="max-w-7xl mx-auto my-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <HoverExpandContainer
                compactView={<CompactCard title="Gemini API 키" icon={Settings} />}
                expandedView={
                    <ApiKeyManager
                        appState={appState}
                        saveAppState={saveAppState}
                        isValidatingApi={isValidatingApi}
                        validateApiKey={validateApiKey}
                        deleteApiKeyFromStorage={deleteApiKeyFromStorage}
                    />
                }
            />
            <HoverExpandContainer
                compactView={<CompactCard title="Hugging Face API 키" icon={Bot} />}
                expandedView={<HuggingFaceApiKeyManager manager={huggingFaceManager} />}
            />
            <HoverExpandContainer
                compactView={<CompactCard title="Pixabay API 키" icon={ImagePlus} />}
                expandedView={
                    <PixabayApiKeyManager
                        apiKey={pixabayManager.pixabayApiKey}
                        setApiKey={pixabayManager.setPixabayApiKey}
                        isValidated={pixabayManager.isPixabayApiKeyValidated}
                        isValidating={pixabayManager.isPixabayValidating}
                        validateApiKey={pixabayManager.validatePixabayApiKey}
                        deleteApiKey={pixabayManager.deletePixabayApiKeyFromStorage}
                    />
                }
            />
        </div>
    );
};
