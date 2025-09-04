"use client";

import { useState } from "react";
import { AIChatButton } from "./ai-chat-button";
import { AIChatDialog } from "./ai-chat-dialog";
import PageGeneratorDialog from "./page-generator-dialog";

export function AIChatContainer() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPageGeneratorOpen, setIsPageGeneratorOpen] = useState(false);

  const handleChatToggle = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handlePageGeneratorToggle = () => {
    setIsPageGeneratorOpen(true);
  };

  return (
    <>
      <AIChatButton
        onChatClick={handleChatToggle}
        onPageGeneratorClick={handlePageGeneratorToggle}
        isOpen={isChatOpen}
      />
      <AIChatDialog open={isChatOpen} onOpenChange={setIsChatOpen} />
      <PageGeneratorDialog open={isPageGeneratorOpen} onOpenChange={setIsPageGeneratorOpen} />
    </>
  );
}
