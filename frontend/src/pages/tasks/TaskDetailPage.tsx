import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, isPast, differenceInDays } from "date-fns";
import { vi } from "date-fns/locale";
import {
  ArrowLeft,
  AlertTriangle,
  Clock,
  Building2,
  Calendar,
  UserCircle,
  Paperclip,
  CheckCircle2,
  Upload,
  X,
  FileText,
  Users,
  RefreshCw,
  Pencil,
  Tag,
} from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import TaskStatusBadge from "@/components/common/TaskStatusBadge";
import EditTaskDialog from "@/components/tasks/EditTaskDialog";
import { tasksService } from "@/services/tasks.service";
import { useAuthStore } from "@/stores/auth.store";
import { Role, TaskStatus } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type AttachmentItem = { url: string; name: string; size?: number };

function normalizeAtt(att: AttachmentItem | string): AttachmentItem {
  if (typeof att === "string")
    return { url: att, name: att.split("/").pop() ?? att };
  return att;
}

function fmtSize(bytes?: number) {
  if (bytes == null) return null;
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const FREQUENCY_LABELS: Record<string, string> = {
  once: "Một lần",
  weekly: "Hàng tuần",
  monthly: "Hàng tháng",
  quarterly: "Hàng quý",
};

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isAdmin = user?.role === Role.ADMIN;

  const [resultContent, setResultContent] = useState("");
  const [completionRate, setCompletionRate] = useState("");
  const [resultFiles, setResultFiles] = useState<File[]>([]);
  const [explanationContent, setExplanationContent] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [uploadingResult, setUploadingResult] = useState(false);
  const [uploadingExplanation, setUploadingExplanation] = useState(false);
  const [isDraggingResult, setIsDraggingResult] = useState(false);
  const [isDraggingExplanation, setIsDraggingExplanation] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const explanationFileRef = useRef<HTMLInputElement>(null);
  const resultFileRef = useRef<HTMLInputElement>(null);

  const taskId = Number(id);

  const { data: task, isLoading } = useQuery({
    queryKey: ["tasks", taskId],
    queryFn: () => tasksService.getOne(taskId),
    enabled: !!taskId,
  });

  const addResultMutation = useMutation({
    mutationFn: async () => {
      let attachments: Array<{ url: string; name: string; size?: number }> = [];
      if (resultFiles.length > 0) {
        setUploadingResult(true);
        try {
          const uploaded = await Promise.all(
            resultFiles.map((f) => tasksService.uploadFile(taskId, f)),
          );
          attachments = uploaded.map((r, i) => ({
            url: r.url,
            name: r.originalName,
            size: resultFiles[i].size,
          }));
        } finally {
          setUploadingResult(false);
        }
      }
      return tasksService.addResult(taskId, {
        content: resultContent,
        completionRate: completionRate ? Number(completionRate) : undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
      });
    },
    onSuccess: () => {
      toast.success("Cập nhật kết quả thành công");
      setResultContent("");
      setCompletionRate("");
      setResultFiles([]);
      queryClient.invalidateQueries({ queryKey: ["tasks", taskId] });
    },
    onError: () => toast.error("Không thể cập nhật kết quả"),
  });

  const addExplanationMutation = useMutation({
    mutationFn: async () => {
      let attachments: Array<{ url: string; name: string; size?: number }> = [];
      if (attachedFiles.length > 0) {
        setUploadingExplanation(true);
        try {
          const uploaded = await Promise.all(
            attachedFiles.map((f) => tasksService.uploadFile(taskId, f)),
          );
          attachments = uploaded.map((r, i) => ({
            url: r.url,
            name: r.originalName,
            size: attachedFiles[i].size,
          }));
        } finally {
          setUploadingExplanation(false);
        }
      }
      return tasksService.addResult(taskId, {
        content: explanationContent,
        attachments: attachments.length > 0 ? attachments : undefined,
        isExplanation: true,
      });
    },
    onSuccess: () => {
      toast.success("Đã gửi giải trình thành công");
      setExplanationContent("");
      setAttachedFiles([]);
      queryClient.invalidateQueries({ queryKey: ["tasks", taskId] });
    },
    onError: () => toast.error("Không thể gửi giải trình"),
  });

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-4xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!task)
    return <p className="text-muted-foreground">Không tìm thấy công việc</p>;

  const isOverdue = task.status === TaskStatus.OVERDUE;
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const isDeadlinePassed = task.deadline
    ? isPast(new Date(task.deadline))
    : false;
  const showExplanation =
    !isAdmin && !isCompleted && (isOverdue || isDeadlinePassed);
  const showResultForm = !isAdmin && !isCompleted && !isOverdue;
  const daysOverdue =
    task.deadline && isDeadlinePassed
      ? differenceInDays(new Date(), new Date(task.deadline))
      : 0;

  const normalResults = task.results.filter((r) => !r.isExplanation);
  const explanations = task.results.filter((r) => r.isExplanation);
  const latestRate = normalResults.find(
    (r) => r.completionRate != null,
  )?.completionRate;

  return (
    <div className="space-y-5 w-full">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại
        </Button>
      </div>

      {/* Overdue banner */}
      {isOverdue && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-destructive">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div className="text-sm">
            <span className="font-semibold">Nhiệm vụ đã quá hạn</span>
            {daysOverdue > 0 && (
              <span className="ml-1">({daysOverdue} ngày)</span>
            )}
            {!isAdmin && (
              <span className="ml-1">
                — Đơn vị cần nộp bản giải trình theo quy định.
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main info card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Nhiệm vụ
              </p>
              <h1 className="text-xl font-bold leading-snug">{task.title}</h1>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <TaskStatusBadge status={task.status as TaskStatus} />
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditOpen(true)}
                >
                  <Pencil className="h-3.5 w-3.5 mr-1" /> Chỉnh sửa
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {task.content && (
            <>
              <div>
                <p className="text-sm text-muted-foreground mb-1.5 font-medium uppercase tracking-wide">
                  Nội dung
                </p>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {task.content}
                </p>
              </div>
              <Separator />
            </>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 text-sm">
            {task.linhVuc && (
              <div className="flex gap-2.5 items-start">
                <Tag className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground mb-0.5">Lĩnh vực</p>
                  <p className="font-medium">{task.linhVuc}</p>
                </div>
              </div>
            )}
            <div className="flex gap-2.5 items-start">
              <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground mb-0.5">
                  Đơn vị chủ trì
                </p>
                <p className="font-medium">
                  {task.leadDepartment?.name ?? "—"}
                </p>
              </div>
            </div>
            <div className="flex gap-2.5 items-start">
              <RefreshCw className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground mb-0.5">Chu kỳ</p>
                <p className="font-medium">
                  {FREQUENCY_LABELS[task.frequency] ?? task.frequency}
                </p>
              </div>
            </div>
            {task.deadline && (
              <div className="flex gap-2.5 items-start">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground mb-0.5">
                    Thời hạn
                  </p>
                  <p
                    className={cn(
                      "font-medium",
                      isDeadlinePassed && "text-destructive",
                    )}
                  >
                    {format(new Date(task.deadline), "dd/MM/yyyy HH:mm", {
                      locale: vi,
                    })}
                  </p>
                </div>
              </div>
            )}
            {task.assignedBy && (
              <div className="flex gap-2.5 items-start">
                <UserCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground mb-0.5">
                    Người giao
                  </p>
                  <p className="font-medium">{task.assignedBy.fullName}</p>
                </div>
              </div>
            )}
            <div className="flex gap-2.5 items-start">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground mb-0.5">Ngày tạo</p>
                <p className="font-medium">
                  {format(new Date(task.createdAt), "dd/MM/yyyy", {
                    locale: vi,
                  })}
                </p>
              </div>
            </div>
            {task.reminderBefore !== undefined && task.reminderBefore > 0 && (
              <div className="flex gap-2.5 items-start">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground mb-0.5">
                    Nhắc trước
                  </p>
                  <p className="font-medium">{task.reminderBefore} ngày</p>
                </div>
              </div>
            )}
          </div>

          {task.cooperatingDepartments.length > 0 && (
            <>
              <Separator />
              <div className="flex gap-2.5 items-start">
                <Users className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1.5">
                    Đơn vị phối hợp
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {task.cooperatingDepartments.map((d) => (
                      <Badge
                        key={d.id}
                        variant="outline"
                        className="font-normal"
                      >
                        {d.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {latestRate != null && (
            <>
              <Separator />
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">
                    Tiến độ hoàn thành
                  </span>
                  <span className="font-semibold">{latestRate}%</span>
                </div>
                <Progress value={Number(latestRate)} className="h-2" />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            Kết quả thực hiện
            {normalResults.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {normalResults.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {normalResults.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Chưa có kết quả nào được báo cáo
            </p>
          ) : (
            normalResults.map((result, idx) => (
              <div
                key={result.id}
                className={cn(
                  "rounded-lg border p-3.5 space-y-2",
                  idx === 0 && "border-primary/30 bg-primary/5",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <UserCircle className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium">
                      {result.department?.name ??
                        result.submittedBy?.fullName ??
                        "—"}
                    </span>
                    {idx === 0 && (
                      <Badge variant="secondary" className="text-xs">
                        Mới nhất
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {format(new Date(result.createdAt), "dd/MM/yyyy HH:mm", {
                      locale: vi,
                    })}
                  </span>
                </div>
                {result.content && (
                  <p className="text-sm leading-relaxed pl-9">
                    {result.content}
                  </p>
                )}
                <div className="pl-9 flex flex-wrap gap-2">
                  {result.completionRate !== undefined && (
                    <Badge variant="outline">
                      {result.completionRate}% hoàn thành
                    </Badge>
                  )}
                  {result.attachments?.map((raw, i) => {
                    const att = normalizeAtt(raw);
                    const size = fmtSize(att.size);
                    return (
                      <a
                        key={i}
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-primary hover:underline border rounded px-2 py-1"
                      >
                        <Paperclip className="h-3 w-3" />
                        <span>{att.name}</span>
                        {size && (
                          <span className="text-muted-foreground">
                            ({size})
                          </span>
                        )}
                      </a>
                    );
                  })}
                </div>
              </div>
            ))
          )}

          {showResultForm && (
            <div className="border-t pt-4 space-y-3">
              <p className="text-sm font-medium">Báo cáo kết quả thực hiện</p>
              <Textarea
                placeholder="Nhập nội dung kết quả thực hiện..."
                value={resultContent}
                onChange={(e) => setResultContent(e.target.value)}
                rows={3}
              />

              <div>
                <Label className="text-xs mb-1.5 block">
                  File đính kèm (báo cáo, văn bản, hình ảnh...)
                </Label>
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
                    isDraggingResult
                      ? "border-primary bg-primary/10"
                      : "hover:bg-muted/50",
                  )}
                  onClick={() => resultFileRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingResult(true);
                  }}
                  onDragLeave={() => setIsDraggingResult(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingResult(false);
                    const dropped = Array.from(e.dataTransfer.files).filter(
                      (f) => /\.(pdf|docx?|xlsx?|png|jpe?g)$/i.test(f.name),
                    );
                    if (dropped.length > 0)
                      setResultFiles((prev) => [...prev, ...dropped]);
                  }}
                >
                  <Upload
                    className={cn(
                      "h-6 w-6 mx-auto mb-1.5",
                      isDraggingResult
                        ? "text-primary"
                        : "text-muted-foreground",
                    )}
                  />
                  <p className="text-sm text-muted-foreground">
                    Nhấn hoặc kéo thả file vào đây
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    PDF, Word, Excel, hình ảnh — tối đa 10MB
                  </p>
                </div>
                <input
                  ref={resultFileRef}
                  type="file"
                  multiple
                  aria-label="Chọn file đính kèm báo cáo"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? []);
                    setResultFiles((prev) => [...prev, ...files]);
                    e.target.value = "";
                  }}
                />
                {resultFiles.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {resultFiles.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded border px-2.5 py-1.5 text-xs"
                      >
                        <div className="flex items-center gap-1.5">
                          <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="truncate max-w-xs">{f.name}</span>
                          <span className="text-muted-foreground">
                            ({(f.size / 1024).toFixed(0)} KB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setResultFiles((prev) =>
                              prev.filter((_, idx) => idx !== i),
                            )
                          }
                          aria-label={`Xóa file ${f.name}`}
                          className="text-muted-foreground hover:text-destructive ml-2"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 items-end">
                <div className="w-40">
                  <Label className="text-xs">Tỷ lệ hoàn thành (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    placeholder="0–100"
                    value={completionRate}
                    onChange={(e) => setCompletionRate(e.target.value)}
                  />
                </div>
                <Button
                  onClick={() => addResultMutation.mutate()}
                  disabled={
                    addResultMutation.isPending ||
                    uploadingResult ||
                    (!resultContent &&
                      resultFiles.length === 0 &&
                      !completionRate)
                  }
                >
                  {uploadingResult
                    ? "Đang upload..."
                    : addResultMutation.isPending
                      ? "Đang gửi..."
                      : "Gửi báo cáo"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Giải trình section */}
      {(showExplanation || explanations.length > 0) && (
        <Card className={cn(isOverdue && "border-destructive/40")}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-destructive" />
              <span className={cn(isOverdue && "text-destructive")}>
                Giải trình chậm muộn
              </span>
              {explanations.length > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {explanations.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {explanations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-2">
                Chưa có bản giải trình nào
              </p>
            ) : (
              explanations.map((exp) => (
                <div
                  key={exp.id}
                  className="rounded-lg border border-destructive/20 bg-destructive/5 p-3.5 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">
                      {exp.department?.name ?? exp.submittedBy?.fullName ?? "—"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(exp.createdAt), "dd/MM/yyyy HH:mm", {
                        locale: vi,
                      })}
                    </span>
                  </div>
                  {exp.content && (
                    <p className="text-sm leading-relaxed">{exp.content}</p>
                  )}
                  {exp.attachments && exp.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {exp.attachments.map((raw, i) => {
                        const att = normalizeAtt(raw);
                        const size = fmtSize(att.size);
                        return (
                          <a
                            key={i}
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs text-primary hover:underline border rounded px-2 py-1"
                          >
                            <Paperclip className="h-3 w-3" />
                            <span>{att.name}</span>
                            {size && (
                              <span className="text-muted-foreground">
                                ({size})
                              </span>
                            )}
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))
            )}

            {showExplanation && (
              <div className="border-t pt-4 space-y-3">
                <p className="text-sm font-medium">Nộp bản giải trình</p>
                <Textarea
                  placeholder="Trình bày lý do chậm muộn và biện pháp khắc phục..."
                  value={explanationContent}
                  onChange={(e) => setExplanationContent(e.target.value)}
                  rows={4}
                />

                <div>
                  <Label className="text-xs mb-1.5 block">
                    Tài liệu đính kèm
                  </Label>
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
                      isDraggingExplanation
                        ? "border-destructive bg-destructive/10"
                        : "hover:bg-muted/50",
                    )}
                    onClick={() => explanationFileRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingExplanation(true);
                    }}
                    onDragLeave={() => setIsDraggingExplanation(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingExplanation(false);
                      const dropped = Array.from(e.dataTransfer.files).filter(
                        (f) => /\.(pdf|docx?|xlsx?|png|jpe?g)$/i.test(f.name),
                      );
                      if (dropped.length > 0)
                        setAttachedFiles((prev) => [...prev, ...dropped]);
                    }}
                  >
                    <Upload
                      className={cn(
                        "h-6 w-6 mx-auto mb-1.5",
                        isDraggingExplanation
                          ? "text-destructive"
                          : "text-muted-foreground",
                      )}
                    />
                    <p className="text-sm text-muted-foreground">
                      Nhấn hoặc kéo thả file vào đây
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      PDF, Word, Excel, hình ảnh — tối đa 10MB
                    </p>
                  </div>
                  <input
                    ref={explanationFileRef}
                    type="file"
                    multiple
                    aria-label="Chọn file đính kèm giải trình"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                    onChange={(e) => {
                      const files = Array.from(e.target.files ?? []);
                      setAttachedFiles((prev) => [...prev, ...files]);
                      e.target.value = "";
                    }}
                  />
                  {attachedFiles.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      {attachedFiles.map((f, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded border px-2.5 py-1.5 text-xs"
                        >
                          <div className="flex items-center gap-1.5">
                            <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="truncate max-w-xs">{f.name}</span>
                            <span className="text-muted-foreground">
                              ({(f.size / 1024).toFixed(0)} KB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setAttachedFiles((prev) =>
                                prev.filter((_, idx) => idx !== i),
                              )
                            }
                            aria-label={`Xóa file ${f.name}`}
                            className="text-muted-foreground hover:text-destructive ml-2"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => addExplanationMutation.mutate()}
                    disabled={
                      addExplanationMutation.isPending ||
                      uploadingExplanation ||
                      !explanationContent
                    }
                    variant="destructive"
                  >
                    {uploadingExplanation
                      ? "Đang upload..."
                      : addExplanationMutation.isPending
                        ? "Đang gửi..."
                        : "Nộp giải trình"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isAdmin && (
        <EditTaskDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          task={task}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["tasks", taskId] });
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            setEditOpen(false);
          }}
        />
      )}
    </div>
  );
}
