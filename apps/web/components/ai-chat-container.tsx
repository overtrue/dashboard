"use client";

import { useState } from "react";
import { AIChatButton } from "./ai-chat-button";
import { AIChatDialog } from "./ai-chat-dialog";

export function AIChatContainer() {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <AIChatButton onClick={handleToggle} isOpen={isOpen} />
      <AIChatDialog open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
