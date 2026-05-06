import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  ClipboardList,
  Building2,
  Users,
  BarChart3,
  Bell,
  LogOut,
  ChevronUp,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { Role } from "@/types";
import NotificationBadge from "@/components/notifications/NotificationBadge";

const navItems = [
  {
    to: "/dashboard",
    label: "Tổng quan",
    icon: LayoutDashboard,
    roles: [Role.ADMIN, Role.UNIT_LEAD, Role.UNIT_MEMBER],
  },
  {
    to: "/tasks",
    label: "Công việc",
    icon: ClipboardList,
    roles: [Role.ADMIN, Role.UNIT_LEAD, Role.UNIT_MEMBER],
  },
  { to: "/departments", label: "Đơn vị", icon: Building2, roles: [Role.ADMIN] },
  { to: "/users", label: "Tài khoản", icon: Users, roles: [Role.ADMIN] },
  { to: "/reports", label: "Báo cáo", icon: BarChart3, roles: [Role.ADMIN] },
  {
    to: "/notifications",
    label: "Thông báo",
    icon: Bell,
    roles: [Role.ADMIN, Role.UNIT_LEAD, Role.UNIT_MEMBER],
  },
];

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const visibleNavItems = navItems.filter(
    (item) => user && item.roles.includes(user.role),
  );

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <div className="flex items-center gap-2 px-4 py-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 border-b border-sidebar-border">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-yellow-500 text-blue-950 font-bold text-sm shadow-sm">
                CA
              </div>
              <div className="group-data-[collapsible=icon]:hidden overflow-hidden">
                <p className="text-sm font-bold leading-none text-white tracking-wide">
                  CAHY
                </p>
                <p className="text-xs text-sidebar-foreground/60 mt-0.5">
                  Quản lý công việc
                </p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              {visibleNavItems.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    size="lg"
                    isActive={location.pathname.startsWith(item.to)}
                    tooltip={item.label}
                    className={
                      location.pathname.startsWith(item.to)
                        ? "text-yellow-400 font-semibold text-[15px]"
                        : "text-sidebar-foreground/80 text-[15px]"
                    }
                  >
                    <NavLink to={item.to}>
                      <item.icon className="shrink-0" />
                      <span className="group-data-[collapsible=icon]:hidden">
                        {item.label}
                      </span>
                      {item.to === "/notifications" && <NotificationBadge />}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton size="lg">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="text-sm font-semibold">
                          {user?.fullName?.charAt(0) ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate text-sm group-data-[collapsible=icon]:hidden">
                        {user?.fullName}
                      </span>
                      <ChevronUp className="ml-auto h-4 w-4 group-data-[collapsible=icon]:hidden" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="top"
                    className="w-(--radix-popper-anchor-width)"
                  >
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Đăng xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 overflow-auto bg-background">
          <div className="flex h-14 items-center border-b border-border px-4 gap-2 bg-white shadow-sm">
            <SidebarTrigger />
            <div className="h-5 w-px bg-border mx-1" />
            <span className="text-sm text-muted-foreground font-medium tracking-wide uppercase">
              Hệ thống Quản lý Công việc
            </span>
          </div>
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
