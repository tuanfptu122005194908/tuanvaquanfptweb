import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Download, Users, Mail, Phone, ShoppingBag, DollarSign, Calendar, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { AdminUser } from "@/hooks/useAdminData";
import { useState } from "react";

interface UsersTabProps {
  users: AdminUser[];
  isLoading: boolean;
  onRefresh: () => void;
}

const UsersTab = ({ users, isLoading, onRefresh }: UsersTabProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const deleteUser = async (userId: string, userName: string) => {
    if (!confirm(`⚠️ Bạn có chắc chắn muốn xóa người dùng "${userName}"? Tất cả đơn hàng của họ cũng sẽ bị xóa!`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast.success("Xóa người dùng thành công!");
      onRefresh();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error("Không thể xóa người dùng!");
    }
  };

  const exportCSV = () => {
    if (users.length === 0) {
      toast.error("Không có dữ liệu để xuất!");
      return;
    }

    const headers = ['ID', 'Tên', 'Email', 'SĐT', 'Số đơn hàng', 'Tổng chi tiêu', 'Ngày đăng ký'];
    const csvContent = [
      headers.join(','),
      ...users.map(user => [
        user.id,
        `"${user.name}"`,
        user.email || 'Chưa có',
        user.phone || 'Chưa có',
        user.order_count,
        user.total_spent,
        new Date(user.created_at).toLocaleDateString('vi-VN')
      ].join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `users_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Xuất CSV thành công!");
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (user.phone && user.phone.includes(searchQuery))
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/30 rounded-full animate-pulse"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Quản lý người dùng</h2>
          <p className="text-muted-foreground">Tổng: {users.length} người dùng</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={exportCSV} variant="outline" className="shrink-0">
            <Download className="h-4 w-4 mr-2" />
            Xuất CSV
          </Button>
        </div>
      </div>

      {/* Users Grid */}
      {filteredUsers.length === 0 ? (
        <Card className="p-12 text-center border-0 shadow-lg">
          <Users className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">
            {searchQuery ? 'Không tìm thấy người dùng phù hợp' : 'Chưa có người dùng nào'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <Card 
              key={user.id} 
              className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <div className="h-2 bg-gradient-to-r from-primary to-secondary" />
              
              <div className="p-5">
                {/* User Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary font-bold text-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{user.name}</h4>
                      <p className="text-xs text-muted-foreground font-mono">{user.id.slice(0, 8)}...</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteUser(user.id, user.name)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground truncate">{user.email || 'Chưa có email'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{user.phone || 'Chưa có SĐT'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Đăng ký: {new Date(user.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-3 pt-4 border-t">
                  <div className="flex-1 bg-blue-50 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                      <ShoppingBag className="h-4 w-4" />
                    </div>
                    <p className="text-xl font-bold text-blue-700">{user.order_count}</p>
                    <p className="text-xs text-blue-600">Đơn hàng</p>
                  </div>
                  <div className="flex-1 bg-emerald-50 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-emerald-600 mb-1">
                      <DollarSign className="h-4 w-4" />
                    </div>
                    <p className="text-lg font-bold text-emerald-700">{user.total_spent >= 1000000 ? `${(user.total_spent / 1000000).toFixed(1)}M` : `${(user.total_spent / 1000).toFixed(0)}K`}</p>
                    <p className="text-xs text-emerald-600">Chi tiêu</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UsersTab;
