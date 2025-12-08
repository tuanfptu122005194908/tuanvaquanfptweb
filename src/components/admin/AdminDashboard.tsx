import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  ArrowLeft, 
  LogOut, 
  RefreshCw, 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Ticket, 
  Package, 
  Settings 
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

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const { stats, orders, users, isLoading, refreshData } = useAdminData();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
    toast.success("Đã cập nhật dữ liệu!");
  };

  const tabs = [
    { value: "overview", label: "Tổng quan", icon: LayoutDashboard },
    { value: "orders", label: "Đơn hàng", icon: ShoppingCart },
    { value: "users", label: "Người dùng", icon: Users },
    { value: "coupons", label: "Mã giảm giá", icon: Ticket },
    { value: "products", label: "Sản phẩm", icon: Package },
    { value: "settings", label: "Cài đặt", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/50">
      {/* Header with Glassmorphism */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-white/20 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-primary rounded-xl blur-lg opacity-50"></div>
                <div className="relative p-3 bg-gradient-primary rounded-xl shadow-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">Quản lý hệ thống TUAN VA QUAN</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => window.location.href = '/'}
                className="hover:bg-white/50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Trang chính</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="hover:bg-white/50"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button 
                variant="ghost" 
                onClick={onLogout}
                className="hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Modern Tab Navigation */}
          <div className="relative">
            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm rounded-2xl"></div>
            <TabsList className="relative w-full grid grid-cols-3 md:grid-cols-6 gap-2 p-2 bg-transparent h-auto">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="relative flex flex-col md:flex-row items-center gap-2 py-3 px-4 rounded-xl data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:bg-white/60 data-[state=inactive]:hover:bg-white transition-all duration-300"
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="text-xs md:text-sm font-medium">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Tab Contents with Animation */}
          <div className="animate-in fade-in-50 duration-300">
            <TabsContent value="overview" className="mt-0">
              <OverviewTab stats={stats} orders={orders} isLoading={isLoading} />
            </TabsContent>

            <TabsContent value="orders" className="mt-0">
              <OrdersTab orders={orders} isLoading={isLoading} onRefresh={refreshData} />
            </TabsContent>

            <TabsContent value="users" className="mt-0">
              <UsersTab users={users} isLoading={isLoading} onRefresh={refreshData} />
            </TabsContent>

            <TabsContent value="coupons" className="mt-0">
              <CouponsTab />
            </TabsContent>

            <TabsContent value="products" className="mt-0">
              <ProductsTab />
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              <SettingsTab />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
