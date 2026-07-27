import { useRef, type ComponentType, type Ref } from 'react';
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
import { LayoutGridIcon } from '@/components/icons/layout-grid';
import { BookTextIcon } from '@/components/icons/book-text';
import { MessageSquareIcon } from '@/components/icons/message-square';
import { CalendarDaysIcon } from '@/components/icons/calendar-days';
import { UsersIcon } from '@/components/icons/users';
import { useGoogleAuth } from '@/providers/GoogleAuthProvider';
import { sound } from '@/lib/sounds';
import { useAppPath } from '@/lib/app-paths';

type AnimIconHandle = {
  startAnimation: () => void;
  stopAnimation: () => void;
};

type AnimIconProps = {
  size?: number;
  className?: string;
};

type NavIcon = ComponentType<AnimIconProps & { ref?: Ref<AnimIconHandle> }> | ComponentType<{ size?: number; className?: string }>;

const navItems: {
  title: string;
  url: string;
  icon: NavIcon;
  end?: boolean;
  group: 'general' | 'other';
}[] = [
  { title: 'Dashboard', url: '/app', icon: HomeIcon, end: true, group: 'general' },
  { title: 'Calendar', url: '/calendar', icon: CalendarDaysIcon, group: 'general' },
  { title: 'Categories', url: '/categories', icon: LayoutGridIcon, group: 'general' },
  { title: 'Team members', url: '/team', icon: UsersIcon, group: 'general' },
  { title: 'Guide', url: '/guide', icon: BookTextIcon, group: 'other' },
  { title: 'Feedback', url: '/feedback', icon: MessageSquareIcon, group: 'other' },
];

function SidebarNavItem({
  item,
  isActive,
  to,
}: {
  item: (typeof navItems)[number];
  isActive: boolean;
  to: string;
}) {
  const iconRef = useRef<AnimIconHandle>(null);
  const Icon = item.icon as ComponentType<AnimIconProps & { ref?: Ref<AnimIconHandle> }>;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.title}
        className="!rounded-[6px] data-[active=true]:bg-elevated data-[active=true]:font-medium data-[active=true]:text-sidebar-foreground data-[active=true]:shadow-[0_0_0_1px_var(--surface-border)] dark:data-[active=true]:shadow-[0_0_0_1px_var(--surface-border)]"
      >
        <NavLink
          to={to}
          end={item.end}
          onClick={() => sound.click()}
          onMouseEnter={() => iconRef.current?.startAnimation()}
          onMouseLeave={() => iconRef.current?.stopAnimation()}
        >
          <Icon ref={iconRef} size={16} className="size-4 shrink-0" />
          <span>{item.title}</span>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function NavGroup({
  label,
  items,
  isItemActive,
  appPath,
}: {
  label: string;
  items: (typeof navItems)[number][];
  isItemActive: (item: (typeof navItems)[number]) => boolean;
  appPath: (path: string) => string;
}) {
  return (
    <SidebarGroup className="px-3 py-3">
      <SidebarGroupLabel className="px-2">{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarNavItem
              key={item.title}
              item={item}
              isActive={isItemActive(item)}
              to={appPath(item.url)}
            />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const { authState } = useGoogleAuth();
  const location = useLocation();
  const appPath = useAppPath();

  const user = authState.user;
  const displayName = user?.name ?? 'User';
  const displayEmail = user?.email ?? '';
  const displayImage = user?.imageUrl ?? '';
  const initials = displayName.charAt(0).toUpperCase() || 'U';

  const isItemActive = (item: (typeof navItems)[number]) => {
    const target = appPath(item.url);
    if (item.end) return location.pathname === target;
    return location.pathname === target || location.pathname.startsWith(`${target}/`);
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
        <NavGroup
          label="General"
          items={navItems.filter((item) => item.group === 'general')}
          isItemActive={isItemActive}
          appPath={appPath}
        />
        <NavGroup
          label="Other"
          items={navItems.filter((item) => item.group === 'other')}
          isItemActive={isItemActive}
          appPath={appPath}
        />
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
