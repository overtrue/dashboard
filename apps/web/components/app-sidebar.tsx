"use client";

import * as React from "react";
import { useState } from "react";

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
} from "@remixicon/react";

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
};

// 菜单数据结构
interface MenuItem {
  id: string;
  title: string;
  url?: string;
  icon?: string;
  isActive?: boolean;
  children?: MenuItem[];
}

interface MenuSection {
  id: string;
  type: 'user_custom' | 'admin_fixed';
  title: string;
  items: MenuItem[];
}

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

// 示例菜单数据
const menuData: MenuSection[] = [
  {
    id: 'user_custom',
    type: 'user_custom',
    title: 'Sections',
    items: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        url: '#',
        icon: 'RiScanLine',
        children: [
          { id: 'overview', title: 'Overview', url: '/dashboard/overview' },
          { id: 'analytics', title: 'Analytics', url: '/dashboard/analytics' },
          { id: 'reports', title: 'Reports', url: '/dashboard/reports' },
        ]
      },
      {
        id: 'insights',
        title: 'Insights',
        url: '#',
        icon: 'RiBardLine',
        children: [
          { id: 'trends', title: 'Trends', url: '/insights/trends' },
          { id: 'predictions', title: 'Predictions', url: '/insights/predictions' },
        ]
      },
      {
        id: 'contacts',
        title: 'Contacts',
        url: '/contacts',
        icon: 'RiUserFollowLine',
        isActive: true,
      },
      {
        id: 'tools',
        title: 'Tools',
        url: '#',
        icon: 'RiCodeSSlashLine',
        children: [
          { id: 'api', title: 'API Keys', url: '/tools/api' },
          { id: 'webhooks', title: 'Webhooks', url: '/tools/webhooks' },
          { id: 'integrations', title: 'Integrations', url: '/tools/integrations' },
        ]
      },
    ]
  },
  {
    id: 'system_admin',
    type: 'admin_fixed',
    title: '系统管理',
    items: [
      {
        id: 'data_sources',
        title: '数据源',
        url: '/data-sources',
        icon: 'RiDatabase2Line',
      },
      {
        id: 'projects',
        title: '项目',
        url: '/projects',
        icon: 'RiFolderLine',
      },
      {
        id: 'users',
        title: '用户管理',
        url: '/admin/users',
        icon: 'RiUserLine',
      },
      {
        id: 'settings',
        title: '系统设置',
        url: '#',
        icon: 'RiSettings3Line',
        children: [
          { id: 'general', title: '常规设置', url: '/admin/settings/general' },
          { id: 'security', title: '安全设置', url: '/admin/settings/security' },
          { id: 'notifications', title: '通知设置', url: '/admin/settings/notifications' },
        ]
      }
    ]
  }
];

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userId?: string;
  isAdmin?: boolean;
}

export function AppSidebar({ isAdmin = true, ...props }: AppSidebarProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(['dashboard', 'settings']));

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
                    <a href={subItem.url || '#'}>
                      <span>{subItem.title}</span>
                    </a>
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
          <a href={item.url || '#'}>
            {IconComponent && (
              <IconComponent
                className="text-muted-foreground/60 group-data-[active=true]/menu-button:text-primary"
                size={22}
                aria-hidden="true"
              />
            )}
            <span>{item.title}</span>
          </a>
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
        {/* 用户自定义菜单区域 */}
        {userSections.map(renderMenuSection)}

        {/* 分隔线 */}
        {userSections.length > 0 && isAdmin && adminSections.length > 0 && (
          <hr className="border-t border-border mx-4 my-2" />
        )}

        {/* 管理员固定菜单区域 */}
        {adminSections.map(renderMenuSection)}
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
