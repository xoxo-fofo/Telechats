import React, { useState } from 'react';
import { TeleChatsProvider, useTeleChats } from './context/TeleChatsContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { TopicFeed } from './components/TopicFeed';
import { ChatView } from './components/ChatView';
import { DirectMessagesView } from './components/DirectMessagesView';
import { VoiceRoomModal } from './components/VoiceRoomModal';
import { CreateRoomModal } from './components/CreateRoomModal';
import { OnboardingModal } from './components/OnboardingModal';
import { JoinInviteModal } from './components/JoinInviteModal';
import { CiCdModal } from './components/CiCdModal';
import { AuthModal } from './components/AuthModal';
import { SettingsModal } from './components/SettingsModal';
import { RoomRulesModal } from './components/RoomRulesModal';

const MainLayout: React.FC = () => {
  const { activeRoom, activeContact } = useTeleChats();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0e1621] text-slate-100 font-sans select-none">
      {/* Top Header */}
      <Header onToggleSidebar={() => setMobileSidebarOpen(prev => !prev)} />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Topic Tree & Contacts Sidebar */}
        <Sidebar
          isOpenOnMobile={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Dynamic Center Stage */}
        <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#0e1621] relative">
          {activeRoom ? (
            <ChatView />
          ) : activeContact ? (
            <DirectMessagesView />
          ) : (
            <TopicFeed />
          )}
        </main>
      </div>

      {/* Interactive Modals */}
      <VoiceRoomModal />
      <CreateRoomModal />
      <OnboardingModal />
      <JoinInviteModal />
      <CiCdModal />
      <AuthModal />
      <SettingsModal />
      <RoomRulesModal />
    </div>
  );
};

export default function App() {
  return (
    <TeleChatsProvider>
      <MainLayout />
    </TeleChatsProvider>
  );
}
