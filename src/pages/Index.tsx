
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { MainContentSection } from '@/components/sections/MainContentSection';
import { OneClickSection } from '@/components/sections/OneClickSection';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { DuplicateErrorDialog } from '@/components/dialogs/DuplicateErrorDialog';
import { TopicSelectionDialog } from '@/components/dialogs/TopicSelectionDialog';
import { TopicConfirmDialog } from '@/components/dialogs/TopicConfirmDialog';
import { ImageClipboardDialog } from '@/components/dialogs/ImageClipboardDialog';
import { useRefactoredAppController } from '@/hooks/useRefactoredAppController';
import { useIsMobile } from '@/hooks/use-mobile';

export const Index: React.FC = () => {
  const controller = useRefactoredAppController();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Toaster />

      <Header
        session={controller.session}
        loading={controller.authLoading}
        handleLogin={() => controller.handleLogin({ email: '', password: '' })}
        handleSignUp={() => controller.handleSignUp({ email: '', password: '' })}
        handleLogout={controller.handleLogout}
        profile={controller.profile}
        onResetApp={controller.handleResetApp}
        preventDuplicates={controller.preventDuplicates}
        onPreventDuplicatesToggle={controller.handlePreventDuplicatesToggle}
      />

      <OneClickSection
        handleLatestIssueOneClick={controller.handleLatestIssueOneClick}
        handleEvergreenKeywordOneClick={controller.handleEvergreenKeywordOneClick}
        isOneClickGenerating={controller.isOneClickGenerating}
        handleStopOneClick={controller.handleStopOneClick}
        appState={controller.appState}
        isGeneratingContent={controller.generationStatus.isGeneratingContent}
      />

      <MainContentSection
        appState={controller.appState}
        saveAppState={controller.saveAppState}
        generationStatus={controller.generationStatus}
        generationFunctions={controller.generationFunctions}
        topicControls={controller.topicControls}
        utilityFunctions={{
          ...controller.utilityFunctions,
          openImageClipboard: controller.pixabayClipboard.openClipboardDialog,
          hasImages: controller.pixabayClipboard.images.length > 0,
        }}
        preventDuplicates={controller.preventDuplicates}
        handleTopicConfirm={controller.handleTopicConfirm}
        deleteReferenceData={() => 
          controller.saveAppState({ 
            referenceLink: '', 
            referenceSentence: '' 
          })
        }
        geminiManager={controller.geminiManager}
        pixabayManager={controller.pixabayManager}
        huggingFaceManager={controller.huggingFaceManager}
      />

      <TopicConfirmDialog
        open={controller.showTopicConfirmDialog}
        onOpenChange={controller.setShowTopicConfirmDialog}
        topic={controller.pendingTopic}
        onConfirm={controller.handleTopicConfirm}
        onCancel={controller.handleTopicCancel}
      />

      <TopicSelectionDialog
        open={controller.showTopicSelectionDialog}
        onOpenChange={(open) => {
          if (!open) {
            controller.setShowTopicSelectionDialog(false);
            if (controller.isOneClickGenerating) {
              controller.handleStopOneClick();
            }
          }
        }}
        topics={controller.appState.topics}
        onSelectTopic={controller.handleTopicSelect}
        title={
          controller.oneClickMode === 'latest' 
            ? '최신 이슈 주제 선택' 
            : controller.oneClickMode === 'evergreen' 
              ? '평생 키워드 주제 선택' 
              : '생성된 주제 선택'
        }
      />

      <DuplicateErrorDialog
        open={controller.showDuplicateErrorDialog}
        onOpenChange={controller.setShowDuplicateErrorDialog}
      />

      <ImageClipboardDialog
        open={controller.pixabayClipboard.showClipboardDialog}
        onOpenChange={controller.pixabayClipboard.closeClipboardDialog}
        images={controller.pixabayClipboard.images}
      />

      <Footer isMobile={isMobile} />
    </div>
  );
};

export default Index;
