import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Bell, BellOff, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { notificationsService } from "@/services/notifications.service";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationsService.getAll,
  });

  const markReadMutation = useMutation({
    mutationFn: notificationsService.markAsRead,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: notificationsService.markAllAsRead,
    onSuccess: () => {
      toast.success("Đã đánh dấu tất cả là đã đọc");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  return (
    <div className="space-y-4 w-full">
      <div className="rounded-xl bg-linear-to-r from-primary to-primary/80 px-6 py-5 flex items-center justify-between text-white shadow-md">
        <div>
          <h1 className="text-2xl font-bold">Thông báo</h1>
          <p className="text-sm text-white/70 mt-0.5">
            {unreadCount > 0
              ? `${unreadCount} thông báo chưa đọc`
              : "Tất cả đã được đọc"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            className="bg-white text-primary hover:bg-white/90 font-semibold shadow"
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Đọc tất cả
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : !notifications?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <BellOff className="h-10 w-10 mb-3 opacity-50" />
            <p>Không có thông báo nào</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={cn(
                "cursor-pointer transition-colors hover:bg-muted/50",
                !notification.isRead && "border-primary/50 bg-primary/5",
              )}
              onClick={() =>
                !notification.isRead && markReadMutation.mutate(notification.id)
              }
            >
              <CardContent className="flex gap-3 py-3">
                <div
                  className={cn(
                    "mt-0.5 shrink-0 w-7 h-7 rounded-full flex items-center justify-center",
                    notification.isRead ? "bg-muted" : "bg-primary/20",
                  )}
                >
                  <Bell
                    className={cn(
                      "h-3.5 w-3.5",
                      notification.isRead
                        ? "text-muted-foreground"
                        : "text-primary",
                    )}
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p
                      className={cn(
                        "text-sm",
                        !notification.isRead && "font-semibold",
                      )}
                    >
                      {notification.title}
                    </p>
                    {!notification.isRead && (
                      <Badge variant="default" className="h-4 px-1 text-[10px]">
                        Mới
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {notification.message}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(
                      new Date(notification.createdAt),
                      "dd/MM/yyyy HH:mm",
                      { locale: vi },
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
