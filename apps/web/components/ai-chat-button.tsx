"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { RiCloseLine, RiRobot2Line } from "@remixicon/react";
import { useState } from "react";

interface AIChatButtonProps {
  onClick: () => void;
  isOpen?: boolean;
}

export function AIChatButton({ onClick, isOpen = false }: AIChatButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="fixed bottom-6 right-6 z-50">
            <Button
              onClick={onClick}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className={cn(
                "h-14 w-14 rounded-full shadow-lg transition-all duration-300 ease-in-out",
                "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
                "hover:scale-110 hover:shadow-xl",
                "focus:outline-none focus:ring-4 focus:ring-blue-300",
                isOpen && "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700"
              )}
              size="icon"
            >
              <div className="relative">
                {isOpen ? (
                  <RiCloseLine className="h-6 w-6 text-white transition-transform duration-300" />
                ) : (
                  <RiRobot2Line
                    className={cn(
                      "h-6 w-6 text-white transition-all duration-300",
                      isHovered && "animate-pulse"
                    )}
                  />
                )}

                {/* 脉冲动画效果 */}
                {!isOpen && (
                  <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20"></div>
                )}
              </div>
            </Button>

            {/* 状态指示器 */}
            {!isOpen && (
              <div className="absolute -top-1 -right-1">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-gray-900 text-white">
          <p>{isOpen ? "关闭AI助手" : "打开AI助手"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
