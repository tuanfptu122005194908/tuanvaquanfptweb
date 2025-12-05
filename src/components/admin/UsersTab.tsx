import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Download } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { AdminUser } from "@/hooks/useAdminData";

interface UsersTabProps {
  users: AdminUser[];
  isLoading: boolean;
  onRefresh: () => void;
}

const UsersTab = ({ users, isLoading, onRefresh }: UsersTabProps) => {
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

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Đang tải...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Export Button */}
      <div className="flex justify-end">
        <Button onClick={exportCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Xuất CSV
        </Button>
      </div>

      {/* Users Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>SĐT</TableHead>
              <TableHead>Số đơn hàng</TableHead>
              <TableHead>Tổng chi tiêu</TableHead>
              <TableHead>Ngày đăng ký</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  Chưa có người dùng nào
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono text-xs">{user.id.slice(0, 8)}...</TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-sm">{user.email || 'Chưa có'}</TableCell>
                  <TableCell>{user.phone || 'Chưa có'}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                      {user.order_count} đơn
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold text-primary">
                    {user.total_spent.toLocaleString('vi-VN')}đ
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteUser(user.id, user.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UsersTab;
