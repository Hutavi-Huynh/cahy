import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { format, isPast } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Plus, Search, Calendar, X, Filter, Building2, SlidersHorizontal, Shield, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import TaskStatusBadge from '@/components/common/TaskStatusBadge'
import CreateTaskDialog from '@/components/tasks/CreateTaskDialog'
import { tasksService } from '@/services/tasks.service'
import { departmentsService } from '@/services/departments.service'
import { useAuthStore } from '@/stores/auth.store'
import { Role, TaskStatus, type Task } from '@/types'
import { cn } from '@/lib/utils'

const STATUS_LABELS: Record<string, string> = {
  all: 'Tất cả trạng thái',
  [TaskStatus.PENDING]: 'Chưa thực hiện',
  [TaskStatus.IN_PROGRESS]: 'Đang thực hiện',
  [TaskStatus.COMPLETED]: 'Hoàn thành',
  [TaskStatus.OVERDUE]: 'Quá hạn',
}

const FREQUENCY_LABELS: Record<string, string> = {
  once: 'Một lần',
  weekly: 'Hàng tuần',
  monthly: 'Hàng tháng',
  quarterly: 'Hàng quý',
}

function TaskTableBody({ tasks, loading, colSpan }: { tasks: Task[]; loading: boolean; colSpan: number }) {
  if (loading) {
    return Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={i}>
        {Array.from({ length: colSpan }).map((_, j) => (
          <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
        ))}
      </TableRow>
    ))
  }
  if (tasks.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={colSpan} className="text-center text-muted-foreground py-20">
          Không tìm thấy công việc nào
        </TableCell>
      </TableRow>
    )
  }
  return tasks.map((task) => {
    const overdue = task.deadline && isPast(new Date(task.deadline)) && task.status !== TaskStatus.COMPLETED
    return (
      <TableRow key={task.id} className="h-auto">
        <TableCell className="font-medium py-2">{task.title}</TableCell>
        <TableCell className="py-2 text-muted-foreground">{task.linhVuc ?? '—'}</TableCell>
        <TableCell className="py-2">{task.leadDepartment?.name ?? '—'}</TableCell>
        <TableCell className="py-2">{FREQUENCY_LABELS[task.frequency] ?? task.frequency}</TableCell>
        <TableCell className={cn('py-2', overdue && 'text-destructive font-medium')}>
          {task.deadline ? format(new Date(task.deadline), 'dd/MM/yyyy', { locale: vi }) : '—'}
        </TableCell>
        <TableCell className="py-2"><TaskStatusBadge status={task.status as TaskStatus} /></TableCell>
        <TableCell className="py-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/tasks/${task.id}`}>Xem</Link>
          </Button>
        </TableCell>
      </TableRow>
    )
  })
}

export default function TasksPage() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === Role.ADMIN
  const unitDeptId = user?.departmentId
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [deptFilter, setDeptFilter] = useState<string>('all')
  const [deadlineFrom, setDeadlineFrom] = useState('')
  const [deadlineTo, setDeadlineTo] = useState('')
  const [appliedDeadline, setAppliedDeadline] = useState<{ from?: string; to?: string }>({})
  const [createOpen, setCreateOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'lead' | 'cooperating'>('lead')

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsService.getAll,
    enabled: isAdmin,
  })

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', { status: statusFilter !== 'all' ? statusFilter : undefined, deptFilter, ...appliedDeadline }],
    queryFn: () => tasksService.getAll({
      status: statusFilter !== 'all' ? statusFilter as TaskStatus : undefined,
      departmentId: isAdmin && deptFilter !== 'all' ? Number(deptFilter) : undefined,
      deadlineFrom: appliedDeadline.from,
      deadlineTo: appliedDeadline.to,
    }),
  })

  const baseFiltered = tasks?.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.leadDepartment?.name.toLowerCase().includes(search.toLowerCase()),
  ) ?? []

  // Admin: single list; Unit: split by role
  const filteredTasks = baseFiltered
  const leadTasks = baseFiltered.filter((t) => t.leadDepartmentId === unitDeptId)
  const cooperatingTasks = baseFiltered.filter((t) =>
    t.cooperatingDepartments?.some((d) => d.id === unitDeptId),
  )

  const activeTasks = activeTab === 'lead' ? leadTasks : cooperatingTasks
  const headerCount = isAdmin ? filteredTasks.length : activeTasks.length

  const hasDeadlineFilter = appliedDeadline.from || appliedDeadline.to
  const applyDeadline = () => setAppliedDeadline({ from: deadlineFrom || undefined, to: deadlineTo || undefined })
  const clearDeadline = () => {
    setDeadlineFrom('')
    setDeadlineTo('')
    setAppliedDeadline({})
  }

  const tableHeaders = (
    <TableHeader>
      <TableRow>
        <TableHead>Tên công việc</TableHead>
        <TableHead>Lĩnh vực</TableHead>
        <TableHead>Đơn vị chủ trì</TableHead>
        <TableHead>Chu kỳ</TableHead>
        <TableHead>Hạn nộp báo cáo</TableHead>
        <TableHead>Trạng thái</TableHead>
        <TableHead className="w-24">Thao tác</TableHead>
      </TableRow>
    </TableHeader>
  )

  return (
    <div className="space-y-4">
      {/* Header banner */}
      <div className="rounded-xl bg-gradient-to-r from-primary to-primary/80 px-6 py-5 flex items-center justify-between text-white shadow-md">
        <div>
          <h1 className="text-2xl font-bold">Danh sách công việc</h1>
          <p className="text-sm text-white/70 mt-0.5">
            {headerCount > 0
              ? `${headerCount} công việc được tìm thấy`
              : 'Quản lý và theo dõi toàn bộ nhiệm vụ'}
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setCreateOpen(true)}
            className="bg-white text-primary hover:bg-white/90 font-semibold shadow"
          >
            <Plus className="mr-2 h-4 w-4" /> Tạo công việc
          </Button>
        )}
      </div>

      {/* Filter card */}
      <Card className="border shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex gap-3 flex-wrap items-center">
            <div className="relative flex-1 min-w-52">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm tên công việc, đơn vị..."
                className="pl-9 h-10 rounded-lg"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 h-10 shrink-0">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-0 bg-transparent shadow-none p-0 h-auto w-40 focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 h-10 shrink-0">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <Select value={deptFilter} onValueChange={setDeptFilter}>
                  <SelectTrigger className="border-0 bg-transparent shadow-none p-0 h-auto w-44 focus:ring-0">
                    <SelectValue placeholder="Tất cả phòng ban" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả phòng ban</SelectItem>
                    {departments?.map((d) => (
                      <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex gap-3 flex-wrap items-center">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Calendar className="h-4 w-4 text-primary" />
              <span>Hạn nộp báo cáo:</span>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground whitespace-nowrap">Từ</Label>
              <Input type="date" value={deadlineFrom} onChange={(e) => setDeadlineFrom(e.target.value)} className="w-38 h-9 text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground whitespace-nowrap">Đến</Label>
              <Input type="date" value={deadlineTo} onChange={(e) => setDeadlineTo(e.target.value)} className="w-38 h-9 text-sm" />
            </div>
            <Button size="sm" onClick={applyDeadline} disabled={!deadlineFrom && !deadlineTo} className="h-9">
              <Filter className="h-3.5 w-3.5 mr-1.5" /> Áp dụng
            </Button>
            {hasDeadlineFilter && (
              <>
                <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 cursor-default gap-1.5">
                  <Calendar className="h-3 w-3" />
                  {appliedDeadline.from && `${appliedDeadline.from}`}
                  {appliedDeadline.from && appliedDeadline.to && ' → '}
                  {appliedDeadline.to && `${appliedDeadline.to}`}
                </Badge>
                <Button variant="ghost" size="sm" onClick={clearDeadline} className="h-9 text-muted-foreground hover:text-destructive">
                  <X className="h-3.5 w-3.5 mr-1" /> Xóa
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {isAdmin ? (
        <Card>
          <Table>
            {tableHeaders}
            <TableBody>
              <TaskTableBody tasks={filteredTasks} loading={isLoading} colSpan={7} />
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Card>
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as 'lead' | 'cooperating')}
            className="p-4"
          >
            <TabsList className="mb-4">
              <TabsTrigger value="lead" className="gap-2">
                <Shield className="h-3.5 w-3.5" />
                Công việc chủ trì
                <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary">
                  {isLoading ? '...' : leadTasks.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="cooperating" className="gap-2">
                <Users className="h-3.5 w-3.5" />
                Công việc phối hợp
                <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary">
                  {isLoading ? '...' : cooperatingTasks.length}
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="lead" className="mt-0">
              <Table>
                {tableHeaders}
                <TableBody>
                  <TaskTableBody tasks={leadTasks} loading={isLoading} colSpan={7} />
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="cooperating" className="mt-0">
              <Table>
                {tableHeaders}
                <TableBody>
                  <TaskTableBody tasks={cooperatingTasks} loading={isLoading} colSpan={7} />
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </Card>
      )}

      <CreateTaskDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['tasks'] })
          setCreateOpen(false)
        }}
      />
    </div>
  )
}
