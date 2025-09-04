"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { RiCloseLine, RiRobot2Line, RiMagicLine, RiChat4Line, RiArrowDownSLine } from "@remixicon/react";
import { useState } from "react";

interface AIChatButtonProps {
  onChatClick: () => void;
  onPageGeneratorClick: () => void;
  isOpen?: boolean;
}

export function AIChatButton({ onChatClick, onPageGeneratorClick, isOpen = false }: AIChatButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <TooltipProvider>
      <div className="fixed bottom-6 right-6 z-50">
        {isOpen ? (
          // 关闭按钮
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onChatClick}
                className={cn(
                  "h-14 w-14 rounded-full shadow-lg transition-all duration-300 ease-in-out",
                  "bg-muted hover:bg-muted/90",
                  "hover:scale-110 hover:shadow-xl",
                  "focus:outline-none focus:ring-4 focus:ring-ring"
                )}
                size="icon"
              >
                <RiCloseLine className="h-6 w-6 text-muted-foreground transition-transform duration-300" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-gray-900 text-white">
              <p>关闭AI助手</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          // AI功能按钮组
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={cn(
                  "h-14 w-14 rounded-full shadow-lg transition-all duration-300 ease-in-out",
                  "bg-primary hover:bg-primary/90",
                  "hover:scale-110 hover:shadow-xl",
                  "focus:outline-none focus:ring-4 focus:ring-ring",
                  dropdownOpen && "scale-110 shadow-xl"
                )}
                size="icon"
              >
                <div className="relative">
                  <RiRobot2Line
                    className={cn(
                      "h-6 w-6 text-white transition-all duration-300",
                      (isHovered || dropdownOpen) && "animate-pulse"
                    )}
                  />
                  <RiArrowDownSLine className="absolute -bottom-1 -right-1 h-3 w-3 text-white" />

                  {/* 脉冲动画效果 */}
                  {!dropdownOpen && (
                    <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20"></div>
                  )}
                </div>

                {/* 状态指示器 */}
                <div className="absolute -top-1 -right-1">
                  <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                </div>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent 
              side="left" 
              align="end" 
              className="w-56 mr-4"
              sideOffset={8}
            >
              <DropdownMenuItem 
                onClick={() => {
                  onChatClick()
                  setDropdownOpen(false)
                }}
                className="cursor-pointer"
              >
                <RiChat4Line className="mr-3 h-4 w-4" />
                <div className="flex flex-col">
                  <div className="font-medium">AI 对话</div>
                  <div className="text-xs text-muted-foreground">与AI助手聊天</div>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={() => {
                  onPageGeneratorClick()
                  setDropdownOpen(false)
                }}
                className="cursor-pointer"
              >
                <RiMagicLine className="mr-3 h-4 w-4" />
                <div className="flex flex-col">
                  <div className="font-medium">页面生成器</div>
                  <div className="text-xs text-muted-foreground">AI智能生成页面</div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </TooltipProvider>
  );
}
