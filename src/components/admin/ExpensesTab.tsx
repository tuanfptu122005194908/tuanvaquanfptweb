import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, DollarSign, TrendingUp, Calendar, PieChart, AlertTriangle, Target, Settings } from "lucide-react";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

interface Expense {
  id: string;
  category: string;
  description: string | null;
  amount: number;
  expense_date: string;
  created_at: string;
}

const EXPENSE_CATEGORIES = [
  { value: "hosting", label: "Hosting & Domain", color: "bg-blue-500" },
  { value: "marketing", label: "Marketing & Quảng cáo", color: "bg-purple-500" },
  { value: "tools", label: "Công cụ & Phần mềm", color: "bg-green-500" },
  { value: "content", label: "Nội dung & Tài liệu", color: "bg-orange-500" },
  { value: "salary", label: "Lương & Nhân sự", color: "bg-red-500" },
  { value: "other", label: "Chi phí khác", color: "bg-gray-500" },
];

const ExpensesTab = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(new Date().getMonth());
  const [monthlyBudget, setMonthlyBudget] = useState<number>(0);
  const [budgetInput, setBudgetInput] = useState("");
  
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    amount: "",
    expense_date: format(new Date(), "yyyy-MM-dd"),
  });

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("expenses")
        .select("*")
        .order("expense_date", { ascending: false });

      if (selectedMonth !== null) {
        const startDate = startOfMonth(new Date(selectedYear, selectedMonth));
        const endDate = endOfMonth(new Date(selectedYear, selectedMonth));
        query = query
          .gte("expense_date", format(startDate, "yyyy-MM-dd"))
          .lte("expense_date", format(endDate, "yyyy-MM-dd"));
      } else {
        query = query
          .gte("expense_date", `${selectedYear}-01-01`)
          .lte("expense_date", `${selectedYear}-12-31`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast.error("Không thể tải dữ liệu chi tiêu");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBudget = async () => {
    try {
      const budgetKey = `monthly_budget_${selectedYear}_${selectedMonth}`;
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", budgetKey)
        .maybeSingle();
      
      if (error) throw error;
      if (data?.value) {
        setMonthlyBudget(parseFloat(data.value));
        setBudgetInput(data.value);
      } else {
        setMonthlyBudget(0);
        setBudgetInput("");
      }
    } catch (error) {
      console.error("Error fetching budget:", error);
    }
  };

  const saveBudget = async () => {
    try {
      const budgetKey = `monthly_budget_${selectedYear}_${selectedMonth}`;
      const budgetValue = parseFloat(budgetInput) || 0;
      
      const { data: existing } = await supabase
        .from("site_settings")
        .select("id")
        .eq("key", budgetKey)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("site_settings")
          .update({ value: budgetValue.toString() })
          .eq("key", budgetKey);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("site_settings")
          .insert({ key: budgetKey, value: budgetValue.toString() });
        if (error) throw error;
      }

      setMonthlyBudget(budgetValue);
      setIsBudgetDialogOpen(false);
      toast.success("Đã lưu ngân sách tháng");
    } catch (error) {
      console.error("Error saving budget:", error);
      toast.error("Không thể lưu ngân sách");
    }
  };

  useEffect(() => {
    fetchExpenses();
    if (selectedMonth !== null) {
      fetchBudget();
    }
  }, [selectedYear, selectedMonth]);

  const handleSubmit = async () => {
    if (!formData.category || !formData.amount || !formData.expense_date) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Vui lòng đăng nhập lại");
        return;
      }

      const expenseData = {
        category: formData.category,
        description: formData.description || null,
        amount: parseFloat(formData.amount),
        expense_date: formData.expense_date,
        user_id: user.id,
      };

      if (editingExpense) {
        const { error } = await supabase
          .from("expenses")
          .update(expenseData)
          .eq("id", editingExpense.id);
        if (error) throw error;
        toast.success("Đã cập nhật chi tiêu");
      } else {
        const { error } = await supabase
          .from("expenses")
          .insert(expenseData);
        if (error) throw error;
        toast.success("Đã thêm chi tiêu mới");
      }

      setIsDialogOpen(false);
      setEditingExpense(null);
      setFormData({
        category: "",
        description: "",
        amount: "",
        expense_date: format(new Date(), "yyyy-MM-dd"),
      });
      fetchExpenses();
    } catch (error) {
      console.error("Error saving expense:", error);
      toast.error("Không thể lưu chi tiêu");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa chi tiêu này?")) return;

    try {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) throw error;
      toast.success("Đã xóa chi tiêu");
      fetchExpenses();
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("Không thể xóa chi tiêu");
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      category: expense.category,
      description: expense.description || "",
      amount: expense.amount.toString(),
      expense_date: expense.expense_date,
    });
    setIsDialogOpen(true);
  };

  const getCategoryInfo = (category: string) => {
    return EXPENSE_CATEGORIES.find((c) => c.value === category) || EXPENSE_CATEGORIES[5];
  };

  // Calculate statistics
  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const categoryStats = EXPENSE_CATEGORIES.map((cat) => ({
    ...cat,
    total: expenses
      .filter((exp) => exp.category === cat.value)
      .reduce((sum, exp) => sum + Number(exp.amount), 0),
  })).filter((cat) => cat.total > 0);

  const months = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  // Budget calculations
  const budgetUsedPercent = monthlyBudget > 0 ? Math.min((totalExpenses / monthlyBudget) * 100, 100) : 0;
  const isOverBudget = monthlyBudget > 0 && totalExpenses > monthlyBudget;
  const isNearBudget = monthlyBudget > 0 && totalExpenses >= monthlyBudget * 0.8 && !isOverBudget;
  const remainingBudget = monthlyBudget - totalExpenses;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Quản lý chi tiêu</h2>
          <p className="text-muted-foreground">Theo dõi và thống kê chi phí vận hành</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <div className="flex gap-2">
            {selectedMonth !== null && (
              <Dialog open={isBudgetDialogOpen} onOpenChange={setIsBudgetDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-primary/50 hover:bg-primary/10">
                    <Target className="h-4 w-4 mr-2" />
                    Đặt ngân sách
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[400px]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Đặt ngân sách {months[selectedMonth]} {selectedYear}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="budget">Ngân sách hàng tháng (VNĐ)</Label>
                      <Input
                        id="budget"
                        type="number"
                        placeholder="Ví dụ: 5000000"
                        value={budgetInput}
                        onChange={(e) => setBudgetInput(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Bạn sẽ nhận cảnh báo khi chi tiêu vượt 80% hoặc vượt quá ngân sách
                      </p>
                    </div>
                    {monthlyBudget > 0 && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Ngân sách hiện tại: <span className="font-medium text-foreground">{monthlyBudget.toLocaleString("vi-VN")}đ</span>
                        </p>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsBudgetDialogOpen(false)}>
                      Hủy
                    </Button>
                    <Button onClick={saveBudget}>
                      Lưu ngân sách
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90">
                <Plus className="h-4 w-4 mr-2" />
                Thêm chi tiêu
              </Button>
            </DialogTrigger>
          </div>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingExpense ? "Sửa chi tiêu" : "Thêm chi tiêu mới"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Danh mục</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                          {cat.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Số tiền (VNĐ)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expense_date">Ngày chi tiêu</Label>
                <Input
                  id="expense_date"
                  type="date"
                  value={formData.expense_date}
                  onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  placeholder="Mô tả chi tiết..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSubmit}>
                {editingExpense ? "Cập nhật" : "Thêm"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select
          value={selectedYear.toString()}
          onValueChange={(value) => setSelectedYear(parseInt(value))}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={selectedMonth?.toString() ?? "all"}
          onValueChange={(value) => setSelectedMonth(value === "all" ? null : parseInt(value))}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Tất cả tháng" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Cả năm</SelectItem>
            {months.map((month, idx) => (
              <SelectItem key={idx} value={idx.toString()}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Budget Alert */}
      {selectedMonth !== null && monthlyBudget > 0 && (isOverBudget || isNearBudget) && (
        <Alert variant={isOverBudget ? "destructive" : "default"} className={isOverBudget ? "border-destructive/50 bg-destructive/10" : "border-yellow-500/50 bg-yellow-500/10"}>
          <AlertTriangle className={`h-4 w-4 ${isOverBudget ? "text-destructive" : "text-yellow-500"}`} />
          <AlertTitle className={isOverBudget ? "text-destructive" : "text-yellow-600 dark:text-yellow-400"}>
            {isOverBudget ? "Vượt ngân sách!" : "Sắp hết ngân sách!"}
          </AlertTitle>
          <AlertDescription className={isOverBudget ? "text-destructive/90" : "text-yellow-600/90 dark:text-yellow-400/90"}>
            {isOverBudget 
              ? `Bạn đã chi tiêu vượt ${Math.abs(remainingBudget).toLocaleString("vi-VN")}đ so với ngân sách đặt ra.`
              : `Bạn đã sử dụng ${budgetUsedPercent.toFixed(0)}% ngân sách. Còn lại ${remainingBudget.toLocaleString("vi-VN")}đ.`
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Budget Progress Card */}
      {selectedMonth !== null && monthlyBudget > 0 && (
        <Card className={`border-2 ${isOverBudget ? "border-destructive/50 bg-destructive/5" : isNearBudget ? "border-yellow-500/50 bg-yellow-500/5" : "border-primary/30 bg-primary/5"}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className={`h-5 w-5 ${isOverBudget ? "text-destructive" : isNearBudget ? "text-yellow-500" : "text-primary"}`} />
              Tiến độ ngân sách {months[selectedMonth]}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Đã chi tiêu</span>
              <span className={`font-bold ${isOverBudget ? "text-destructive" : "text-foreground"}`}>
                {totalExpenses.toLocaleString("vi-VN")}đ / {monthlyBudget.toLocaleString("vi-VN")}đ
              </span>
            </div>
            <Progress 
              value={budgetUsedPercent} 
              className={`h-3 ${isOverBudget ? "[&>div]:bg-destructive" : isNearBudget ? "[&>div]:bg-yellow-500" : "[&>div]:bg-primary"}`}
            />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {isOverBudget ? "Vượt ngân sách" : "Còn lại"}
              </span>
              <span className={`font-medium ${isOverBudget ? "text-destructive" : "text-green-500"}`}>
                {isOverBudget ? `-${Math.abs(remainingBudget).toLocaleString("vi-VN")}đ` : `${remainingBudget.toLocaleString("vi-VN")}đ`}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng chi tiêu
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isOverBudget ? "text-destructive" : "text-foreground"}`}>
              {totalExpenses.toLocaleString("vi-VN")}đ
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {selectedMonth !== null ? months[selectedMonth] : "Cả năm"} {selectedYear}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Số giao dịch
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{expenses.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Khoản chi tiêu</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Trung bình/giao dịch
            </CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {expenses.length > 0
                ? Math.round(totalExpenses / expenses.length).toLocaleString("vi-VN")
                : 0}đ
            </div>
            <p className="text-xs text-muted-foreground mt-1">Mỗi giao dịch</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {selectedMonth !== null && monthlyBudget > 0 ? "Ngân sách còn" : "Danh mục cao nhất"}
            </CardTitle>
            {selectedMonth !== null && monthlyBudget > 0 ? (
              <Target className="h-4 w-4 text-primary" />
            ) : (
              <PieChart className="h-4 w-4 text-purple-500" />
            )}
          </CardHeader>
          <CardContent>
            {selectedMonth !== null && monthlyBudget > 0 ? (
              <>
                <div className={`text-2xl font-bold ${remainingBudget < 0 ? "text-destructive" : "text-green-500"}`}>
                  {remainingBudget < 0 ? "-" : ""}{Math.abs(remainingBudget).toLocaleString("vi-VN")}đ
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {budgetUsedPercent.toFixed(0)}% đã sử dụng
                </p>
              </>
            ) : categoryStats.length > 0 ? (
              <>
                <div className="text-2xl font-bold text-foreground">
                  {getCategoryInfo(categoryStats.sort((a, b) => b.total - a.total)[0].value).label.split(" ")[0]}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {categoryStats.sort((a, b) => b.total - a.total)[0].total.toLocaleString("vi-VN")}đ
                </p>
              </>
            ) : (
              <div className="text-muted-foreground">--</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      {categoryStats.length > 0 && (
        <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Phân bổ theo danh mục</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryStats.sort((a, b) => b.total - a.total).map((cat) => (
                <div key={cat.value} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-foreground">{cat.label}</span>
                      <span className="text-muted-foreground">
                        {cat.total.toLocaleString("vi-VN")}đ ({Math.round((cat.total / totalExpenses) * 100)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${cat.color} transition-all duration-500`}
                        style={{ width: `${(cat.total / totalExpenses) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expenses Table */}
      <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Danh sách chi tiêu</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Chưa có chi tiêu nào trong khoảng thời gian này
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead className="text-right">Số tiền</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => {
                    const catInfo = getCategoryInfo(expense.category);
                    return (
                      <TableRow key={expense.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(parseISO(expense.expense_date), "dd/MM/yyyy", { locale: vi })}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${catInfo.color} text-white`}>
                            {catInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {expense.description || "-"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {Number(expense.amount).toLocaleString("vi-VN")}đ
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(expense)}
                              className="h-8 w-8"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(expense.id)}
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpensesTab;
