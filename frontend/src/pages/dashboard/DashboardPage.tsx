import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  ClipboardList,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Shield,
  Users,
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
import { Role, TaskStatus, type Task } from "@/types";
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

function TaskTable({ tasks, loading }: { tasks: Task[]; loading: boolean }) {
  const navigate = useNavigate();
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tên công việc</TableHead>
          <TableHead>Lĩnh vực</TableHead>
          <TableHead>Đơn vị chủ trì</TableHead>
          <TableHead>Đơn vị phối hợp</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead>Định kỳ</TableHead>
          <TableHead>Hạn nộp báo cáo</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: 7 }).map((_, j) => (
                <TableCell key={j}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : tasks.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={7}
              className="text-center text-muted-foreground py-10"
            >
              Không có công việc nào
            </TableCell>
          </TableRow>
        ) : (
          tasks.map((task) => (
            <TableRow
              key={task.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => navigate(`/tasks/${task.id}`)}
            >
              <TableCell className="font-medium max-w-55 truncate">
                {task.title}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {task.linhVuc ?? "—"}
              </TableCell>
              <TableCell>{task.leadDepartment?.name ?? "—"}</TableCell>
              <TableCell className="max-w-45 truncate">
                {task.cooperatingDepartments?.length > 0
                  ? task.cooperatingDepartments.map((d) => d.name).join(", ")
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
          ))
        )}
      </TableBody>
    </Table>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === Role.ADMIN;
  const unitDeptId = user?.departmentId;

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

  // Unit-specific splits
  const leadTasks =
    tasks?.filter((t) => t.leadDepartmentId === unitDeptId) ?? [];
  const cooperatingTasks =
    tasks?.filter((t) =>
      t.cooperatingDepartments?.some((d) => d.id === unitDeptId),
    ) ?? [];

  // Admin stats
  const total = summary?.total ?? 0;
  const completed = summary?.completed ?? 0;
  const overdue = summary?.overdue ?? 0;
  const inProgress = summary?.inProgress ?? 0;

  const adminStatsCards = [
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

  // Unit stats computed from tasks
  const unitTotal = tasks?.length ?? 0;
  const unitInProgress =
    tasks?.filter((t) => t.status === TaskStatus.IN_PROGRESS).length ?? 0;
  const unitCompleted =
    tasks?.filter((t) => t.status === TaskStatus.COMPLETED).length ?? 0;
  const unitOverdue =
    tasks?.filter((t) => t.status === TaskStatus.OVERDUE).length ?? 0;

  const unitStatsCards = [
    {
      title: "Tổng công việc",
      value: unitTotal,
      icon: ClipboardList,
      gradient: "from-blue-500 to-blue-700",
      subtitle: "Tất cả nhiệm vụ được giao",
      pct: null,
    },
    {
      title: "Đang thực hiện",
      value: unitInProgress,
      icon: Clock,
      gradient: "from-amber-400 to-orange-500",
      subtitle: "Đang trong tiến độ",
      pct: unitTotal > 0 ? Math.round((unitInProgress / unitTotal) * 100) : 0,
    },
    {
      title: "Hoàn thành",
      value: unitCompleted,
      icon: CheckCircle,
      gradient: "from-emerald-500 to-green-700",
      subtitle: "Đã hoàn tất đúng hạn",
      pct: unitTotal > 0 ? Math.round((unitCompleted / unitTotal) * 100) : 0,
    },
    {
      title: "Quá hạn",
      value: unitOverdue,
      icon: AlertTriangle,
      gradient: "from-red-500 to-rose-700",
      subtitle: "Cần xử lý và giải trình",
      pct: unitTotal > 0 ? Math.round((unitOverdue / unitTotal) * 100) : 0,
    },
  ];

  const unitChartData = [
    {
      name: "Chờ xử lý",
      value: tasks?.filter((t) => t.status === TaskStatus.PENDING).length ?? 0,
      color: "#f59e0b",
    },
    { name: "Đang thực hiện", value: unitInProgress, color: "#3b82f6" },
    { name: "Hoàn thành", value: unitCompleted, color: "#22c55e" },
    { name: "Quá hạn", value: unitOverdue, color: "#ef4444" },
  ].filter((d) => d.value > 0);

  const unitCompletionRate =
    unitTotal > 0 ? Math.round((unitCompleted / unitTotal) * 100) : 0;
  const unitOverdueRate =
    unitTotal > 0 ? Math.round((unitOverdue / unitTotal) * 100) : 0;
  const unitOnTimeRate =
    unitCompleted + unitOverdue > 0
      ? Math.round((unitCompleted / (unitCompleted + unitOverdue)) * 100)
      : 100;
  const unitProcessingRate =
    unitTotal > 0
      ? Math.round(((unitCompleted + unitInProgress) / unitTotal) * 100)
      : 0;

  const unitPerfMetrics = [
    {
      label: "Tỷ lệ hoàn thành",
      value: unitCompletionRate,
      color: "bg-green-500",
      textColor: "text-green-600",
    },
    {
      label: "Đúng hạn (trong số đã xong)",
      value: unitOnTimeRate,
      color: "bg-blue-500",
      textColor: "text-blue-600",
    },
    {
      label: "Đang xử lý + Hoàn thành",
      value: unitProcessingRate,
      color: "bg-yellow-500",
      textColor: "text-yellow-600",
    },
    {
      label: "Tỷ lệ quá hạn",
      value: unitOverdueRate,
      color: "bg-red-500",
      textColor: "text-red-600",
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

      {isAdmin ? (
        <>
          {/* Admin: 2x2 stat cards + pie chart */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid grid-cols-2 gap-4">
              {adminStatsCards.map((card) => (
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

          {/* Admin recent tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Công việc gần đây</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <TaskTable tasks={recentTasks} loading={tasksLoading} />
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Unit: 2x2 stat cards + biểu đồ (giống layout Admin) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid grid-cols-2 gap-4">
              {unitStatsCards.map((card) => (
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
                        {tasksLoading ? (
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

            <Card className="flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  Biểu đồ & Hiệu suất
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 flex-1">
                {tasksLoading ? (
                  <Skeleton className="h-48 w-full" />
                ) : (
                  <>
                    {unitChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie
                            data={unitChartData}
                            cx="50%"
                            cy="50%"
                            outerRadius={72}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {unitChartData.map((entry, index) => (
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
                    <div className="space-y-2.5 border-t pt-3">
                      {unitPerfMetrics.map((m) => (
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

          {/* Unit: tabs Chủ trì / Phối hợp */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Danh sách công việc</CardTitle>
            </CardHeader>
            <CardContent className="p-0 pb-2">
              <Tabs defaultValue="lead" className="px-6">
                <TabsList className="mb-4">
                  <TabsTrigger value="lead" className="gap-2">
                    <Shield className="h-3.5 w-3.5" />
                    Công việc chủ trì
                    <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary">
                      {tasksLoading ? "..." : leadTasks.length}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="cooperating" className="gap-2">
                    <Users className="h-3.5 w-3.5" />
                    Công việc phối hợp
                    <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary">
                      {tasksLoading ? "..." : cooperatingTasks.length}
                    </span>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="lead">
                  <TaskTable tasks={leadTasks} loading={tasksLoading} />
                </TabsContent>
                <TabsContent value="cooperating">
                  <TaskTable tasks={cooperatingTasks} loading={tasksLoading} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
