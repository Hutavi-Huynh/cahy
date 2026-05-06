import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { notificationsService } from '@/services/notifications.service'
import { useAuthStore } from '@/stores/auth.store'

export default function NotificationBadge() {
  const { isAuthenticated } = useAuthStore()

  const { data: count } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: notificationsService.countUnread,
    refetchInterval: 30000,
    enabled: isAuthenticated,
  })

  if (!count || count === 0) return null

  return (
    <Badge variant="destructive" className="ml-auto h-5 w-5 p-0 flex items-center justify-center text-[10px]">
      {count > 99 ? '99+' : count}
    </Badge>
  )
}
