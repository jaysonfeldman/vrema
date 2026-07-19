import { NavLink, useLocation } from 'react-router-dom';
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
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HomeIcon } from '@/components/icons/home';
import { BookTextIcon } from '@/components/icons/book-text';
import { MessageSquareIcon } from '@/components/icons/message-square';
import { useGoogleAuth } from '@/providers/GoogleAuthProvider';
import { sound } from '@/lib/sounds';

const navItems = [
  { title: 'Dashboard', url: '/', icon: HomeIcon, end: true },
  { title: 'Guide', url: '/guide', icon: BookTextIcon },
  { title: 'Feedback', url: '/feedback', icon: MessageSquareIcon },
];

export function AppSidebar() {
  const { authState } = useGoogleAuth();
  const location = useLocation();

  const user = authState.user;
  const displayName = user?.name ?? 'User';
  const displayEmail = user?.email ?? '';
  const displayImage = user?.imageUrl ?? '';
  const initials = displayName.charAt(0).toUpperCase() || 'U';

  const isItemActive = (item: (typeof navItems)[number]) => {
    if (item.end) return location.pathname === item.url;
    return location.pathname === item.url || location.pathname.startsWith(`${item.url}/`);
  };

  return (
    <Sidebar variant="inset" className="p-2 [&_[data-sidebar=sidebar]]:!bg-canvas">
      <SidebarHeader className="px-3 pb-1 pt-3">
        <div className="flex items-center gap-2 px-1">
          <img src="/vrema-logo.png?v=5" alt="Vrema" className="size-5 shrink-0" />
          <span className="text-[20px] font-semibold leading-none tracking-tight">Vrema</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-0">
        <SidebarGroup className="px-3 py-3">
          <SidebarGroupLabel className="px-2">Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isItemActive(item)}
                    tooltip={item.title}
                    className="!rounded-[6px] data-[active=true]:bg-elevated data-[active=true]:font-medium data-[active=true]:text-sidebar-foreground data-[active=true]:shadow-[0_0_0_1px_var(--surface-border)] dark:data-[active=true]:shadow-[0_0_0_1px_var(--surface-border)]"
                  >
                    <NavLink to={item.url} end={item.end} onClick={() => sound.click()}>
                      <item.icon size={16} />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-3 pb-3 pt-1">
        <div className="flex items-center gap-2 px-1 py-1.5">
          <Avatar className="h-8 w-8">
            <AvatarImage src={displayImage} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{displayName}</span>
            <span className="truncate text-xs text-muted-foreground">{displayEmail}</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
