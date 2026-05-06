import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  ClipboardList,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { reportsService } from "@/services/reports.service";
import { tasksService } from "@/services/tasks.service";
import { useAuthStore } from "@/stores/auth.store";
import { Role, TaskStatus } from "@/types";
import TaskStatusBadge from "@/components/common/TaskStatusBadge";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

const FREQUENCY_LABELS: Record<string, string> = {
  once: "Một lần",
  weekly: "Hàng tuần",
  monthly: "Hàng tháng",
  quarterly: "Hàng quý",
};

const CHART_DATA_CONFIG = [
  { key: "pending" as const, name: "Chờ xử lý", color: "#f59e0b" },
  { key: "inProgress" as const, name: "Đang thực hiện", color: "#3b82f6" },
  { key: "completed" as const, name: "Hoàn thành", color: "#22c55e" },
  { key: "overdue" as const, name: "Quá hạn", color: "#ef4444" },
];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === Role.ADMIN;

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["reports", "summary"],
    queryFn: () => reportsService.getSummary(),
    enabled: isAdmin,
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks", "recent"],
    queryFn: () => tasksService.getAll(),
  });

  const recentTasks = tasks?.slice(0, 10) ?? [];

  const total = summary?.total ?? 0;
  const completed = summary?.completed ?? 0;
  const overdue = summary?.overdue ?? 0;
  const inProgress = summary?.inProgress ?? 0;

  const statsCards = [
    {
      title: "Tổng công việc",
      value: summary?.total ?? 0,
      icon: ClipboardList,
      gradient: "from-blue-500 to-blue-700",
      subtitle: "Tất cả nhiệm vụ được giao",
      pct: null,
    },
    {
      title: "Đang thực hiện",
      value: summary?.inProgress ?? 0,
      icon: Clock,
      gradient: "from-amber-400 to-orange-500",
      subtitle: "Đang trong tiến độ",
      pct:
        total > 0 ? Math.round(((summary?.inProgress ?? 0) / total) * 100) : 0,
    },
    {
      title: "Hoàn thành",
      value: summary?.completed ?? 0,
      icon: CheckCircle,
      gradient: "from-emerald-500 to-green-700",
      subtitle: "Đã hoàn tất đúng hạn",
      pct:
        total > 0 ? Math.round(((summary?.completed ?? 0) / total) * 100) : 0,
    },
    {
      title: "Quá hạn",
      value: summary?.overdue ?? 0,
      icon: AlertTriangle,
      gradient: "from-red-500 to-rose-700",
      subtitle: "Cần xử lý và giải trình",
      pct: total > 0 ? Math.round(((summary?.overdue ?? 0) / total) * 100) : 0,
    },
  ];

  const chartData = summary
    ? CHART_DATA_CONFIG.map((cfg) => ({
        name: cfg.name,
        value: summary[cfg.key],
        color: cfg.color,
      })).filter((d) => d.value > 0)
    : [];

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const overdueRate = total > 0 ? Math.round((overdue / total) * 100) : 0;
  const onTimeRate =
    completed + overdue > 0
      ? Math.round((completed / (completed + overdue)) * 100)
      : 100;
  const processingRate =
    total > 0 ? Math.round(((completed + inProgress) / total) * 100) : 0;

  const perfMetrics = [
    {
      label: "Tỷ lệ hoàn thành",
      value: completionRate,
      color: "bg-green-500",
      textColor: "text-green-600",
    },
    {
      label: "Đúng hạn (trong số đã xong)",
      value: onTimeRate,
      color: "bg-blue-500",
      textColor: "text-blue-600",
    },
    {
      label: "Đang xử lý + Hoàn thành",
      value: processingRate,
      color: "bg-yellow-500",
      textColor: "text-yellow-600",
    },
    {
      label: "Tỷ lệ quá hạn",
      value: overdueRate,
      color: "bg-red-500",
      textColor: "text-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tổng quan</h1>
        <p className="text-muted-foreground">Chào mừng, {user?.fullName}</p>
      </div>

      {isAdmin && (
        <div className="grid grid-cols-2 gap-4">
          {/* Left 50%: 2x2 stat cards */}
          <div className="grid grid-cols-2 gap-4">
            {statsCards.map((card) => (
              <Card
                key={card.title}
                className={`bg-linear-to-br ${card.gradient} border-0 text-white overflow-hidden`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-lg font-medium text-white/80 mb-3">
                        {card.title}
                      </p>
                      {summaryLoading ? (
                        <Skeleton className="h-10 w-20 bg-white/30" />
                      ) : (
                        <div className="text-5xl font-bold tracking-tight">
                          {card.value}
                        </div>
                      )}
                      <p className="text-xs text-white/60 mt-2">
                        {card.subtitle}
                      </p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-2xl shrink-0">
                      <card.icon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  {card.pct !== null && (
                    <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs text-white/70">
                      <span>Tỷ lệ / tổng số</span>
                      <span className="font-semibold text-white">
                        {card.pct}%
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Right 50%: pie chart + performance */}
          <Card className="flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                Biểu đồ & Hiệu suất
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 flex-1">
              {summaryLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : (
                <>
                  {/* Donut chart */}
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={72}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          separator=""
                          formatter={(value) => [`${value} công việc`, ""]}
                        />
                        <Legend
                          iconType="circle"
                          iconSize={8}
                          wrapperStyle={{ fontSize: "11px" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-44 flex items-center justify-center text-muted-foreground text-sm">
                      Chưa có dữ liệu
                    </div>
                  )}

                  {/* Performance metrics */}
                  <div className="space-y-2.5 border-t pt-3">
                    {perfMetrics.map((m) => (
                      <div key={m.label}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">
                            {m.label}
                          </span>
                          <span className={`font-semibold ${m.textColor}`}>
                            {m.value}%
                          </span>
                        </div>
                        <Progress
                          value={m.value}
                          className="h-1.5"
                          indicatorClassName={m.color}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bottom: recent tasks table */}
      <Card>
        <CardHeader>
          <CardTitle>Công việc gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          {tasksLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : recentTasks.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              Không có công việc nào
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên công việc</TableHead>
                  <TableHead>Lĩnh vực</TableHead>
                  <TableHead>Đơn vị chủ trì</TableHead>
                  <TableHead>Đơn vị phối hợp</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Định kỳ</TableHead>
                  <TableHead>Thời hạn</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium max-w-55 truncate">
                      {task.title}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {task.linhVuc ?? "—"}
                    </TableCell>
                    <TableCell>{task.leadDepartment?.name ?? "—"}</TableCell>
                    <TableCell className="max-w-45 truncate">
                      {task.cooperatingDepartments?.length > 0
                        ? task.cooperatingDepartments
                            .map((d) => d.name)
                            .join(", ")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <TaskStatusBadge status={task.status as TaskStatus} />
                    </TableCell>
                    <TableCell>
                      {FREQUENCY_LABELS[task.frequency] ?? task.frequency}
                    </TableCell>
                    <TableCell>
                      {task.deadline
                        ? format(new Date(task.deadline), "dd/MM/yyyy", {
                            locale: vi,
                          })
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
