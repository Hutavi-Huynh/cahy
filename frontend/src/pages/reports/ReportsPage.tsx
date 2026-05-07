import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  FileDown,
  Filter,
  X,
  ClipboardList,
  Clock,
  CheckCircle,
  AlertTriangle,
  PauseCircle,
} from "lucide-react";
import * as XLSX from "xlsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TaskStatusBadge from "@/components/common/TaskStatusBadge";
import { reportsService } from "@/services/reports.service";
import { TaskStatus } from "@/types";

const STATUS_VI: Record<string, string> = {
  pending: "Chưa thực hiện",
  in_progress: "Đang thực hiện",
  completed: "Hoàn thành",
  overdue: "Quá hạn",
};

export default function ReportsPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [filter, setFilter] = useState<{ from?: string; to?: string }>({});

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["reports", "summary", filter],
    queryFn: () => reportsService.getSummary(filter),
  });

  const { data: byDept, isLoading: byDeptLoading } = useQuery({
    queryKey: ["reports", "by-department", filter],
    queryFn: () => reportsService.getByDepartment(filter),
  });

  const { data: overdue, isLoading: overdueLoading } = useQuery({
    queryKey: ["reports", "overdue"],
    queryFn: reportsService.getOverdue,
  });

  const exportSummaryExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Tổng hợp
    const summaryData = [
      ["BÁO CÁO THỐNG KÊ NHIỆM VỤ CÔNG TÁC"],
      [
        `Thời gian: ${filter.from ? `Từ ${filter.from}` : ""} ${filter.to ? `đến ${filter.to}` : "(toàn bộ)"}`,
      ],
      [`Xuất ngày: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: vi })}`],
      [],
      ["TỔNG HỢP THEO TRẠNG THÁI"],
      ["Trạng thái", "Số lượng"],
      ["Tổng cộng", summary?.total ?? 0],
      ["Chưa thực hiện", summary?.pending ?? 0],
      ["Đang thực hiện", summary?.inProgress ?? 0],
      ["Hoàn thành", summary?.completed ?? 0],
      ["Quá hạn", summary?.overdue ?? 0],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
    ws1["!cols"] = [{ wch: 25 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, ws1, "Tổng hợp");

    // Sheet 2: Theo đơn vị
    if (byDept && byDept.length > 0) {
      const deptRows = [
        ["THỐNG KÊ THEO ĐƠN VỊ"],
        [],
        ["Đơn vị", "Trạng thái", "Số lượng"],
        ...(
          byDept as Array<{
            departmentName: string;
            status: string;
            count: string;
          }>
        ).map((r) => [
          r.departmentName,
          STATUS_VI[r.status] ?? r.status,
          Number(r.count),
        ]),
      ];
      const ws2 = XLSX.utils.aoa_to_sheet(deptRows);
      ws2["!cols"] = [{ wch: 30 }, { wch: 20 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, ws2, "Theo đơn vị");
    }

    // Sheet 3: Quá hạn
    if (overdue && overdue.length > 0) {
      const overdueRows = [
        ["DANH SÁCH NHIỆM VỤ QUÁ HẠN"],
        [],
        ["Tên nhiệm vụ", "Đơn vị chủ trì", "Thời hạn", "Trạng thái"],
        ...overdue.map((t) => [
          t.title,
          t.leadDepartment?.name ?? "—",
          t.deadline
            ? format(new Date(t.deadline), "dd/MM/yyyy", { locale: vi })
            : "—",
          STATUS_VI[t.status] ?? t.status,
        ]),
      ];
      const ws3 = XLSX.utils.aoa_to_sheet(overdueRows);
      ws3["!cols"] = [{ wch: 40 }, { wch: 25 }, { wch: 15 }, { wch: 18 }];
      XLSX.utils.book_append_sheet(wb, ws3, "Quá hạn");
    }

    XLSX.writeFile(
      wb,
      `BaoCaoNhiemVu_${format(new Date(), "yyyyMMdd_HHmm")}.xlsx`,
    );
  };

  const hasFilter = filter.from || filter.to;

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-linear-to-r from-primary to-primary/80 px-6 py-5 flex items-center justify-between text-white shadow-md">
        <div>
          <h1 className="text-2xl font-bold">Báo cáo thống kê</h1>
          <p className="text-sm text-white/70 mt-0.5">
            {hasFilter
              ? `Đang lọc: ${filter.from ?? "..."} → ${filter.to ?? "..."}`
              : "Tổng hợp tình hình thực hiện nhiệm vụ công tác"}
          </p>
        </div>
        <Button
          onClick={exportSummaryExcel}
          disabled={summaryLoading}
          className="bg-white text-primary hover:bg-white/90 font-semibold shadow"
        >
          <FileDown className="h-4 w-4 mr-2" /> Xuất Excel
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-4 w-4 text-primary" /> Thời gian:
            </span>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground whitespace-nowrap">
                Từ
              </Label>
              <Input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-40 h-9 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground whitespace-nowrap">
                Đến
              </Label>
              <Input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-40 h-9 text-sm"
              />
            </div>
            <Button
              size="sm"
              className="h-9"
              onClick={() =>
                setFilter({ from: from || undefined, to: to || undefined })
              }
            >
              Áp dụng
            </Button>
            {hasFilter && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 text-muted-foreground hover:text-destructive"
                onClick={() => {
                  setFrom("");
                  setTo("");
                  setFilter({});
                }}
              >
                <X className="h-3.5 w-3.5 mr-1" /> Xóa lọc
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {summaryLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        (() => {
          const tot = summary?.total ?? 0;
          const pct = (n: number) =>
            tot > 0 ? Math.round((n / tot) * 100) : 0;
          const cards = [
            {
              label: "Tổng cộng",
              value: tot,
              icon: ClipboardList,
              gradient: "from-blue-500 to-blue-700",
              sub: "Tất cả nhiệm vụ",
              pct: null,
            },
            {
              label: "Chưa thực hiện",
              value: summary?.pending ?? 0,
              icon: PauseCircle,
              gradient: "from-slate-500 to-slate-700",
              sub: "Chờ triển khai",
              pct: pct(summary?.pending ?? 0),
            },
            {
              label: "Đang thực hiện",
              value: summary?.inProgress ?? 0,
              icon: Clock,
              gradient: "from-amber-400 to-orange-500",
              sub: "Đang trong tiến độ",
              pct: pct(summary?.inProgress ?? 0),
            },
            {
              label: "Hoàn thành",
              value: summary?.completed ?? 0,
              icon: CheckCircle,
              gradient: "from-emerald-500 to-green-700",
              sub: "Đã hoàn tất",
              pct: pct(summary?.completed ?? 0),
            },
            {
              label: "Quá hạn",
              value: summary?.overdue ?? 0,
              icon: AlertTriangle,
              gradient: "from-red-500 to-rose-700",
              sub: "Cần xử lý gấp",
              pct: pct(summary?.overdue ?? 0),
            },
          ];
          return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {cards.map((card) => (
                <Card
                  key={card.label}
                  className={`bg-gradient-to-br ${card.gradient} border-0 text-white overflow-hidden`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-base font-medium text-white/80 leading-tight">
                        {card.label}
                      </p>
                      <div className="bg-white/20 p-1.5 rounded-xl shrink-0">
                        <card.icon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="text-5xl font-bold tracking-tight mb-1">
                      {card.value}
                    </div>
                    <p className="text-xs text-white/60">{card.sub}</p>
                    {card.pct !== null && (
                      <div className="mt-2 pt-2 border-t border-white/20 flex items-center justify-between text-xs text-white/70">
                        <span>Tỷ lệ</span>
                        <span className="font-semibold text-white">
                          {card.pct}%
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          );
        })()
      )}

      {/* Thống kê theo đơn vị */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Thống kê theo đơn vị</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Đơn vị</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Số lượng</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {byDeptLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 3 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : !byDept || byDept.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center text-muted-foreground py-8"
                >
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              (
                byDept as Array<{
                  departmentName: string;
                  status: string;
                  count: string;
                }>
              ).map((r, i) => (
                <TableRow key={i} className="h-auto">
                  <TableCell className="py-2 font-medium">
                    {r.departmentName}
                  </TableCell>
                  <TableCell className="py-2">
                    <TaskStatusBadge status={r.status as TaskStatus} />
                  </TableCell>
                  <TableCell className="py-2 text-right font-semibold">
                    {r.count}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Danh sách quá hạn */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nhiệm vụ quá hạn</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên nhiệm vụ</TableHead>
              <TableHead>Đơn vị chủ trì</TableHead>
              <TableHead>Thời hạn</TableHead>
              <TableHead>Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {overdueLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 4 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : overdue?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground py-8"
                >
                  Không có nhiệm vụ quá hạn
                </TableCell>
              </TableRow>
            ) : (
              overdue?.map((task) => (
                <TableRow key={task.id} className="h-auto">
                  <TableCell className="font-medium py-2">
                    {task.title}
                  </TableCell>
                  <TableCell className="py-2">
                    {task.leadDepartment?.name ?? "—"}
                  </TableCell>
                  <TableCell className="py-2 text-destructive">
                    {task.deadline
                      ? format(new Date(task.deadline), "dd/MM/yyyy", {
                          locale: vi,
                        })
                      : "—"}
                  </TableCell>
                  <TableCell className="py-2">
                    <TaskStatusBadge status={task.status as TaskStatus} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
