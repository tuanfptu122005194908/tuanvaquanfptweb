import { Button } from "@/components/ui/button";
import { Trash2, Download, Users, Mail, Phone, ShoppingBag, DollarSign, Calendar, Search, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { AdminUser } from "@/hooks/useAdminData";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface UsersTabProps {
  users: AdminUser[];
  isLoading: boolean;
  onRefresh: () => void;
}

type SortField = 'name' | 'order_count' | 'total_spent' | 'created_at';
type SortDirection = 'asc' | 'desc';

const UsersTab = ({ users, isLoading, onRefresh }: UsersTabProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-4 w-4 inline ml-1" /> : 
      <ChevronDown className="h-4 w-4 inline ml-1" />;
  };

  const filteredAndSortedUsers = users
    .filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.phone && user.phone.includes(searchQuery))
    )
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'order_count':
          comparison = a.order_count - b.order_count;
          break;
        case 'total_spent':
          comparison = a.total_spent - b.total_spent;
          break;
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M₫`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K₫`;
    }
    return `${amount}₫`;
  };

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Quản lý người dùng</h2>
            <p className="text-sm text-muted-foreground">Tổng cộng {users.length} người dùng</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên, email, SĐT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>
          <Button onClick={exportCSV} variant="outline" className="shrink-0 gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Xuất CSV</span>
          </Button>
        </div>
      </div>

      {/* Users Table */}
      {filteredAndSortedUsers.length === 0 ? (
        <div className="bg-card rounded-xl border p-12 text-center">
          <Users className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">
            {searchQuery ? 'Không tìm thấy người dùng phù hợp' : 'Chưa có người dùng nào'}
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-[80px] font-semibold">Avatar</TableHead>
                  <TableHead 
                    className="font-semibold cursor-pointer hover:text-primary transition-colors min-w-[150px]"
                    onClick={() => handleSort('name')}
                  >
                    Người dùng <SortIcon field="name" />
                  </TableHead>
                  <TableHead className="font-semibold min-w-[200px]">Liên hệ</TableHead>
                  <TableHead 
                    className="font-semibold cursor-pointer hover:text-primary transition-colors text-center"
                    onClick={() => handleSort('order_count')}
                  >
                    Đơn hàng <SortIcon field="order_count" />
                  </TableHead>
                  <TableHead 
                    className="font-semibold cursor-pointer hover:text-primary transition-colors text-right"
                    onClick={() => handleSort('total_spent')}
                  >
                    Chi tiêu <SortIcon field="total_spent" />
                  </TableHead>
                  <TableHead 
                    className="font-semibold cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handleSort('created_at')}
                  >
                    Ngày đăng ký <SortIcon field="created_at" />
                  </TableHead>
                  <TableHead className="w-[80px] text-center font-semibold">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedUsers.map((user) => (
                  <TableRow key={user.id} className="group hover:bg-muted/30">
                    <TableCell>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-primary font-bold text-sm border-2 border-primary/20">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                          ID: {user.id.slice(0, 8)}...
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="text-foreground truncate max-w-[180px]">
                            {user.email || <span className="text-muted-foreground italic">Chưa có</span>}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="text-foreground">
                            {user.phone || <span className="text-muted-foreground italic">Chưa có</span>}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant={user.order_count > 0 ? "default" : "secondary"}
                        className="font-semibold"
                      >
                        <ShoppingBag className="h-3 w-3 mr-1" />
                        {user.order_count}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`font-semibold ${user.total_spent > 0 ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                        {formatCurrency(user.total_spent)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        {new Date(user.created_at).toLocaleDateString('vi-VN')}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteUser(user.id, user.name)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Table Footer */}
          <div className="px-4 py-3 border-t bg-muted/30 text-sm text-muted-foreground">
            Hiển thị {filteredAndSortedUsers.length} / {users.length} người dùng
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTab;
