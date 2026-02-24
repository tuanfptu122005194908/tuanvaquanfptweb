import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, X, Gift, Clock, CheckCircle2, XCircle, Trash2, Search, RotateCcw, Trophy, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { usePagination } from "@/hooks/usePagination";
import PaginationControls from "./PaginationControls";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

interface SpinRequest {
  id: string;
  user_id: string;
  status: string;
  prize_value: number | null;
  coupon_code: string | null;
  created_at: string;
  approved_at: string | null;
  completed_at: string | null;
  profile?: { name: string; email: string | null };
}

const FAKE_WINNER_NAMES = [
  "Nguyễn Minh Tuấn", "Trần Thị Hương", "Lê Quốc Bảo", "Phạm Thị Mai", "Võ Thanh Hải",
  "Đặng Thu Trang", "Bùi Quốc Việt", "Hoàng Thị Lan", "Ngô Đức Thắng", "Đỗ Thị Ngọc",
  "Huỳnh Anh Khoa", "Phan Văn Đạt", "Vũ Thị Hà", "Lý Minh Phúc", "Dương Thị Yến",
  "Trịnh Quang Huy", "Mai Thị Linh", "Đinh Văn Phong", "Lương Thế Vinh", "Tạ Thị Thanh",
  "Cao Bá Quát", "Hồ Thị Thảo", "Châu Minh Đức", "Lâm Thị Kim", "Tô Văn Hoàng",
];
const FAKE_WINNER_PRIZES = [100000, 80000, 50000, 70000, 60000];
const FAKE_EMAILS = [
  "tuan.nm@gmail.com", "huong.tt@gmail.com", "bao.lq@gmail.com", "mai.pt@gmail.com", "hai.vt@gmail.com",
  "trang.dt@gmail.com", "viet.bq@gmail.com", "lan.ht@gmail.com", "thang.nd@gmail.com", "ngoc.dt@gmail.com",
  "khoa.ha@gmail.com", "dat.pv@gmail.com", "ha.vt@gmail.com", "phuc.lm@gmail.com", "yen.dt@gmail.com",
  "huy.tq@gmail.com", "linh.mt@gmail.com", "phong.dv@gmail.com", "vinh.lt@gmail.com", "thanh.tt@gmail.com",
  "quat.cb@gmail.com", "thao.ht@gmail.com", "duc.cm@gmail.com", "kim.lt@gmail.com", "hoang.tv@gmail.com",
];

function shuffleSeed<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const SpinManagementTab = () => {
  const [requests, setRequests] = useState<SpinRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFakeList, setShowFakeList] = useState(true);

  // Generate fake winners list - shuffled but stable per session
  const fakeWinners = useMemo(() => {
    const seed = Math.floor(Date.now() / 3600000); // changes every hour
    const names = shuffleSeed(FAKE_WINNER_NAMES, seed);
    const prizes = shuffleSeed(FAKE_WINNER_PRIZES, seed + 1);
    const emails = shuffleSeed(FAKE_EMAILS, seed + 2);
    return names.map((name, i) => ({
      name,
      email: emails[i % emails.length],
      prize: prizes[i % prizes.length],
      code: `SPIN${String.fromCharCode(65 + (i % 26))}${Math.floor(1000 + ((seed * (i + 1)) % 9000))}${String.fromCharCode(65 + ((i * 3) % 26))}X`,
      time: `${1 + (i * 7 + seed) % 48}h trước`,
    }));
  }, []);

  useEffect(() => {
    fetchRequests();

    const channel = supabase
      .channel("admin-spin-requests")
      .on("postgres_changes", { event: "*", schema: "public", table: "spin_requests" }, () => {
        fetchRequests();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("spin_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles for each request
      const userIds = [...new Set((data || []).map((r: any) => r.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, email")
        .in("id", userIds);

      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

      setRequests(
        (data || []).map((r: any) => ({
          ...r,
          profile: profileMap.get(r.user_id) || { name: "Unknown", email: null },
        }))
      );
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách yêu cầu!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from("spin_requests")
        .update({ status: "approved", approved_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      toast.success("Đã duyệt yêu cầu quay! ✅");
      fetchRequests();
    } catch (err) {
      toast.error("Không thể duyệt!");
    }
  };

  const handleDeny = async (id: string) => {
    try {
      const { error } = await supabase
        .from("spin_requests")
        .update({ status: "denied" })
        .eq("id", id);
      if (error) throw error;
      toast.success("Đã từ chối yêu cầu.");
      fetchRequests();
    } catch (err) {
      toast.error("Không thể từ chối!");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa yêu cầu này?")) return;
    try {
      const { error } = await supabase.from("spin_requests").delete().eq("id", id);
      if (error) throw error;
      toast.success("Đã xóa!");
      fetchRequests();
    } catch (err) {
      toast.error("Không thể xóa!");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30"><Clock className="h-3 w-3 mr-1" />Chờ duyệt</Badge>;
      case "approved":
        return <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/30"><CheckCircle2 className="h-3 w-3 mr-1" />Đã duyệt</Badge>;
      case "completed":
        return <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30"><Gift className="h-3 w-3 mr-1" />Đã quay</Badge>;
      case "denied":
        return <Badge className="bg-red-500/15 text-red-600 border-red-500/30"><XCircle className="h-3 w-3 mr-1" />Từ chối</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredRequests = requests.filter(
    (r) =>
      r.profile?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.profile?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.coupon_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  const {
    currentPage, totalPages, paginatedItems, setPage, nextPage, prevPage,
    goToFirstPage, goToLastPage, startIndex, endIndex, totalItems,
  } = usePagination({ items: filteredRequests, itemsPerPage: 10 });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/30 rounded-full animate-pulse" />
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border bg-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-amber-500/20 to-pink-500/20 rounded-lg">
                <Gift className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Vòng Quay May Mắn</h2>
                <p className="text-sm text-muted-foreground">
                  {requests.length} yêu cầu · {pendingCount > 0 && (
                    <span className="text-amber-500 font-medium">{pendingCount} chờ duyệt</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background"
                />
              </div>
              <Button variant="outline" size="icon" onClick={fetchRequests}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fake Winners Display List */}
      <Card className="border bg-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <h3 className="font-semibold text-foreground">Danh sách trúng thưởng (hiển thị cho khách)</h3>
              <Badge variant="outline" className="text-xs">Fake</Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFakeList(!showFakeList)}
              className="gap-1"
            >
              {showFakeList ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {showFakeList ? "Ẩn" : "Hiện"}
            </Button>
          </div>
          {showFakeList && (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">#</TableHead>
                    <TableHead>Tên</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Giải thưởng</TableHead>
                    <TableHead>Mã coupon</TableHead>
                    <TableHead>Thời gian</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fakeWinners.map((w, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-medium">{w.name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{w.email}</TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 font-mono">
                          {w.prize.toLocaleString("vi-VN")}₫
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{w.code}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{w.time}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            ⚠️ Danh sách này là fake, tự động shuffle mỗi giờ. Hiển thị trên trang chủ cho khách hàng thấy.
          </p>
        </CardContent>
      </Card>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <Card className="border bg-card">
          <CardContent className="p-12 text-center">
            <Gift className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">Chưa có yêu cầu quay nào</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {paginatedItems.map((req) => (
              <Card key={req.id} className="border bg-card hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {req.profile?.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{req.profile?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{req.profile?.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(req.created_at).toLocaleString("vi-VN")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      {getStatusBadge(req.status)}
                      
                      {req.status === "completed" && req.prize_value && (
                        <Badge variant="outline" className="font-mono">
                          {req.prize_value.toLocaleString("vi-VN")}₫ · {req.coupon_code}
                        </Badge>
                      )}

                      <div className="flex gap-1.5 ml-auto sm:ml-0">
                        {req.status === "pending" && (
                          <>
                            <Button size="sm" onClick={() => handleApprove(req.id)} className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1 h-8">
                              <Check className="h-3.5 w-3.5" /> Duyệt
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDeny(req.id)} className="text-red-500 border-red-500/30 hover:bg-red-500/10 gap-1 h-8">
                              <X className="h-3.5 w-3.5" /> Từ chối
                            </Button>
                          </>
                        )}
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(req.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-0 shadow-sm overflow-hidden">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              startIndex={startIndex}
              endIndex={endIndex}
              totalItems={totalItems}
              onPageChange={setPage}
              onNextPage={nextPage}
              onPrevPage={prevPage}
              onFirstPage={goToFirstPage}
              onLastPage={goToLastPage}
            />
          </Card>
        </>
      )}
    </div>
  );
};

export default SpinManagementTab;
