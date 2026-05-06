import { Badge } from '@/components/ui/badge'
import { TaskStatus } from '@/types'

const statusConfig: Record<TaskStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  [TaskStatus.PENDING]: { label: 'Chưa thực hiện', variant: 'secondary' },
  [TaskStatus.IN_PROGRESS]: { label: 'Đang thực hiện', variant: 'default' },
  [TaskStatus.COMPLETED]: { label: 'Hoàn thành', variant: 'outline' },
  [TaskStatus.OVERDUE]: { label: 'Quá hạn', variant: 'destructive' },
}

interface Props {
  status: TaskStatus
}

export default function TaskStatusBadge({ status }: Props) {
  const config = statusConfig[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}
