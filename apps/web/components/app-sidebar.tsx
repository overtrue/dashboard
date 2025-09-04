"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";

import { SearchForm } from "@/components/search-form";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  RiArrowRightSLine,
  RiBardLine,
  RiCodeSSlashLine,
  RiDatabase2Line,
  RiFolderLine,
  RiLayoutLeftLine,
  RiLeafLine,
  RiLoginCircleLine,
  RiLogoutBoxLine,
  RiScanLine,
  RiSettings3Line,
  RiUserFollowLine,
  RiUserLine,
  RiPagesLine,
  RiFileLine,
} from "@remixicon/react";

// 动态菜单服务
import { dynamicMenuService, MenuItem, MenuSection } from "@/lib/dynamic-menu-service";

// 图标映射
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iconMap: Record<string, React.ComponentType<any>> = {
  RiScanLine,
  RiBardLine,
  RiUserFollowLine,
  RiCodeSSlashLine,
  RiLoginCircleLine,
  RiLayoutLeftLine,
  RiSettings3Line,
  RiLeafLine,
  RiDatabase2Line,
  RiFolderLine,
  RiUserLine,
  RiPagesLine,
  RiFileLine,
};

// Teams data
const teamsData = [
  {
    name: "InnovaCraft",
    logo: "https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/logo-01_kp2j8x.png",
  },
  {
    name: "Acme Corp.",
    logo: "https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/logo-01_kp2j8x.png",
  },
  {
    name: "Evil Corp.",
    logo: "https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/logo-01_kp2j8x.png",
  },
];

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userId?: string;
  isAdmin?: boolean;
}

export function AppSidebar({ isAdmin = true, ...props }: AppSidebarProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(['dashboard', 'settings']));
  const [menuData, setMenuData] = useState<MenuSection[]>([]);
  const [loading, setLoading] = useState(true);

  // 加载动态菜单数据
  useEffect(() => {
    const loadMenuData = async () => {
      try {
        const data = await dynamicMenuService.getMenuData();
        setMenuData(data);
      } catch (error) {
        console.error('Error loading menu data:', error);
        // 如果加载失败，使用空数据但保持基本结构
        setMenuData([]);
      } finally {
        setLoading(false);
      }
    };

    loadMenuData();
  }, []);

  const toggleItem = (itemId: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(itemId)) {
      newOpenItems.delete(itemId);
    } else {
      newOpenItems.add(itemId);
    }
    setOpenItems(newOpenItems);
  };

  const renderMenuItem = (item: MenuItem) => {
    const IconComponent = item.icon ? iconMap[item.icon] : null;
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openItems.has(item.id);

    if (hasChildren) {
      return (
        <SidebarMenuItem key={item.id}>
          <SidebarMenuButton
            onClick={() => toggleItem(item.id)}
            className="group/menu-button font-medium gap-3 h-9 rounded-md bg-gradient-to-r hover:bg-transparent hover:from-sidebar-accent hover:to-sidebar-accent/40 data-[active=true]:from-primary/20 data-[active=true]:to-primary/5 [&>svg]:size-auto"
            isActive={item.isActive}
          >
            {IconComponent && (
              <IconComponent
                className="text-muted-foreground/60 group-data-[active=true]/menu-button:text-primary"
                size={22}
                aria-hidden="true"
              />
            )}
            <span>{item.title}</span>
            <RiArrowRightSLine
              className={`ml-auto text-muted-foreground/60 transition-transform ${
                isOpen ? 'rotate-90' : ''
              }`}
              size={16}
            />
          </SidebarMenuButton>
          {isOpen && (
            <SidebarMenuSub>
              {item.children?.map((subItem) => (
                <SidebarMenuSubItem key={subItem.id}>
                  <SidebarMenuSubButton asChild isActive={subItem.isActive}>
                    <Link href={subItem.url || '#'}>
                      <span>{subItem.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          )}
        </SidebarMenuItem>
      );
    }

    // 无子菜单的普通菜单项
    return (
      <SidebarMenuItem key={item.id}>
        <SidebarMenuButton
          asChild
          className="group/menu-button font-medium gap-3 h-9 rounded-md bg-gradient-to-r hover:bg-transparent hover:from-sidebar-accent hover:to-sidebar-accent/40 data-[active=true]:from-primary/20 data-[active=true]:to-primary/5 [&>svg]:size-auto"
          isActive={item.isActive}
        >
          <Link href={item.url || '#'}>
            {IconComponent && (
              <IconComponent
                className="text-muted-foreground/60 group-data-[active=true]/menu-button:text-primary"
                size={22}
                aria-hidden="true"
              />
            )}
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  const renderMenuSection = (section: MenuSection) => {
    // 过滤管理员菜单
    if (section.type === 'admin_fixed' && !isAdmin) return null;

    return (
      <SidebarGroup key={section.id}>
        <SidebarGroupLabel className="uppercase text-muted-foreground/60">
          {section.title}
        </SidebarGroupLabel>
        <SidebarGroupContent className="px-2">
          <SidebarMenu>
            {section.items.map(renderMenuItem)}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  };

  // 分离用户菜单和管理员菜单
  const userSections = menuData.filter(section => section.type === 'user_custom');
  const adminSections = menuData.filter(section => section.type === 'admin_fixed');

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teamsData} />
        <hr className="border-t border-border mx-2 -mt-px" />
        <SearchForm className="mt-3" />
      </SidebarHeader>
      <SidebarContent>
        {loading ? (
          // 加载状态
          <div className="px-4 py-6">
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="space-y-2">
                <div className="h-8 bg-muted rounded animate-pulse" />
                <div className="h-8 bg-muted rounded animate-pulse" />
                <div className="h-8 bg-muted rounded animate-pulse" />
              </div>
              <div className="h-4 bg-muted rounded animate-pulse mt-6" />
              <div className="space-y-2">
                <div className="h-8 bg-muted rounded animate-pulse" />
                <div className="h-8 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* 用户自定义菜单区域 */}
            {userSections.map(renderMenuSection)}

            {/* 分隔线 */}
            {userSections.length > 0 && isAdmin && adminSections.length > 0 && (
              <hr className="border-t border-border mx-4 my-2" />
            )}

            {/* 管理员固定菜单区域 */}
            {adminSections.map(renderMenuSection)}
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <hr className="border-t border-border mx-2 -mt-px" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="font-medium gap-3 h-9 rounded-md bg-gradient-to-r hover:bg-transparent hover:from-sidebar-accent hover:to-sidebar-accent/40 data-[active=true]:from-primary/20 data-[active=true]:to-primary/5 [&>svg]:size-auto">
              <RiLogoutBoxLine
                className="text-muted-foreground/60 group-data-[active=true]/menu-button:text-primary"
                size={22}
                aria-hidden="true"
              />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
