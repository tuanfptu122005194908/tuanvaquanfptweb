import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  LogOut, 
  RefreshCw, 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Ticket, 
  Package, 
  Settings,
  Menu,
  X,
  Home,
  Bell
} from "lucide-react";
import { useState } from "react";
import OverviewTab from "./OverviewTab";
import OrdersTab from "./OrdersTab";
import UsersTab from "./UsersTab";
import CouponsTab from "./CouponsTab";
import ProductsTab from "./ProductsTab";
import SettingsTab from "./SettingsTab";
import { toast } from "sonner";
import { useAdminData } from "@/hooks/useAdminData";
import { cn } from "@/lib/utils";

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const { stats, orders, users, isLoading, refreshData } = useAdminData();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
    toast.success("Đã cập nhật dữ liệu!");
  };

  const menuItems = [
    { id: "overview", label: "Tổng quan", icon: LayoutDashboard },
    { id: "orders", label: "Đơn hàng", icon: ShoppingCart, badge: stats?.pendingOrders },
    { id: "users", label: "Người dùng", icon: Users },
    { id: "products", label: "Sản phẩm", icon: Package },
    { id: "coupons", label: "Mã giảm giá", icon: Ticket },
    { id: "settings", label: "Cài đặt", icon: Settings },
  ];

  const handleMenuClick = (id: string) => {
    setActiveTab(id);
    setMobileSidebarOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab stats={stats} orders={orders} isLoading={isLoading} />;
      case "orders":
        return <OrdersTab orders={orders} isLoading={isLoading} onRefresh={refreshData} />;
      case "users":
        return <UsersTab users={users} isLoading={isLoading} onRefresh={refreshData} />;
      case "products":
        return <ProductsTab />;
      case "coupons":
        return <CouponsTab />;
      case "settings":
        return <SettingsTab />;
      default:
        return <OverviewTab stats={stats} orders={orders} isLoading={isLoading} />;
    }
  };

  const currentPage = menuItems.find(item => item.id === activeTab);

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:sticky top-0 left-0 z-50 h-screen bg-gradient-to-b from-card to-card/95 border-r border-border/50 transition-all duration-300 ease-out flex flex-col backdrop-blur-xl",
        sidebarOpen ? "w-64" : "w-[72px]",
        mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border/50">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-primary/25 transition-transform hover:scale-105">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div className={cn(
              "overflow-hidden transition-all duration-300",
              sidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
            )}>
              <h1 className="font-bold text-foreground whitespace-nowrap">Admin Panel</h1>
              <p className="text-xs text-muted-foreground whitespace-nowrap">TUAN VA QUAN</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="hidden lg:flex h-8 w-8 hover:bg-muted/80 transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden h-8 w-8"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ease-out group relative",
                activeTab === item.id 
                  ? "bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/30" 
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground hover:translate-x-1"
              )}
            >
              <div className={cn(
                "flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200",
                activeTab === item.id 
                  ? "bg-white/20" 
                  : "bg-muted/50 group-hover:bg-muted"
              )}>
                <item.icon className={cn(
                  "h-5 w-5 shrink-0 transition-transform group-hover:scale-110",
                  activeTab === item.id ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                )} />
              </div>
              <span className={cn(
                "font-medium text-sm whitespace-nowrap transition-all duration-300",
                sidebarOpen ? "opacity-100" : "opacity-0 w-0"
              )}>
                {item.label}
              </span>
              {item.badge && item.badge > 0 && (
                <span className={cn(
                  "text-xs font-bold rounded-full min-w-[22px] h-[22px] flex items-center justify-center transition-all",
                  activeTab === item.id 
                    ? "bg-white/25 text-white ml-auto" 
                    : "bg-red-500 text-white animate-pulse",
                  !sidebarOpen && "absolute -right-1 -top-1 min-w-[18px] h-[18px] text-[10px]",
                  sidebarOpen && "ml-auto"
                )}>
                  {item.badge}
                </span>
              )}
              {!sidebarOpen && (
                <div className="absolute left-full ml-3 px-3 py-2 bg-foreground text-background text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl">
                  {item.label}
                  <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-foreground rotate-45" />
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-border/50 space-y-1">
          <Button 
            variant="ghost" 
            onClick={() => window.location.href = '/'}
            className={cn(
              "w-full gap-3 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-xl h-11 transition-all duration-200",
              sidebarOpen ? "justify-start" : "justify-center px-0"
            )}
          >
            <Home className="h-5 w-5" />
            <span className={cn(
              "text-sm transition-all duration-300",
              sidebarOpen ? "opacity-100" : "opacity-0 w-0 hidden"
            )}>Về trang chính</span>
          </Button>
          <Button 
            variant="ghost" 
            onClick={onLogout}
            className={cn(
              "w-full gap-3 text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-xl h-11 transition-all duration-200",
              sidebarOpen ? "justify-start" : "justify-center px-0"
            )}
          >
            <LogOut className="h-5 w-5" />
            <span className={cn(
              "text-sm transition-all duration-300",
              sidebarOpen ? "opacity-100" : "opacity-0 w-0 hidden"
            )}>Đăng xuất</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-card border-b flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                {currentPage?.icon && <currentPage.icon className="h-5 w-5 text-primary" />}
                {currentPage?.label || "Dashboard"}
              </h2>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Quản lý hệ thống TUAN VA QUAN
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              <span className="hidden sm:inline">Làm mới</span>
            </Button>
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {stats?.pendingOrders && stats.pendingOrders > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                  {stats.pendingOrders > 9 ? '9+' : stats.pendingOrders}
                </span>
              )}
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>

        {/* Footer */}
        <footer className="h-12 border-t bg-card flex items-center justify-center px-4">
          <p className="text-xs text-muted-foreground">
            © 2024 TUAN VA QUAN. Admin Dashboard v2.0
          </p>
        </footer>
      </div>
    </div>
  );
};

export default AdminDashboard;
