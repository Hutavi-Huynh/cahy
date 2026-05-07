import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from '@/components/ui/form'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { tasksService } from '@/services/tasks.service'
import { departmentsService } from '@/services/departments.service'
import type { Task } from '@/types'
import { TaskFrequency, TaskStatus } from '@/types'

const FREQUENCY_LABELS: Record<TaskFrequency, string> = {
  [TaskFrequency.ONCE]: 'Một lần',
  [TaskFrequency.WEEKLY]: 'Hàng tuần',
  [TaskFrequency.MONTHLY]: 'Hàng tháng',
  [TaskFrequency.QUARTERLY]: 'Hàng quý',
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.PENDING]: 'Chưa thực hiện',
  [TaskStatus.IN_PROGRESS]: 'Đang thực hiện',
  [TaskStatus.COMPLETED]: 'Hoàn thành',
  [TaskStatus.OVERDUE]: 'Quá hạn',
}

const schema = z.object({
  title: z.string().min(1, 'Vui lòng nhập tên công việc'),
  content: z.string().optional(),
  linhVuc: z.string().optional(),
  leadDepartmentId: z.string().optional(),
  cooperatingDepartmentIds: z.array(z.string()).optional(),
  frequency: z.nativeEnum(TaskFrequency),
  deadline: z.string().optional(),
  reminderBefore: z.number().min(0).optional(),
  status: z.nativeEnum(TaskStatus),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task
  onSuccess: () => void
}

export default function EditTaskDialog({ open, onOpenChange, task, onSuccess }: Props) {
  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsService.getAll,
  })

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: task.title,
      content: task.content ?? '',
      linhVuc: task.linhVuc ?? '',
      leadDepartmentId: task.leadDepartmentId ? String(task.leadDepartmentId) : undefined,
      cooperatingDepartmentIds: task.cooperatingDepartments?.map((d) => String(d.id)) ?? [],
      frequency: task.frequency,
      deadline: task.deadline ? task.deadline.slice(0, 16) : '',
      reminderBefore: task.reminderBefore ?? 0,
      status: task.status as TaskStatus,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        title: task.title,
        content: task.content ?? '',
        linhVuc: task.linhVuc ?? '',
        leadDepartmentId: task.leadDepartmentId ? String(task.leadDepartmentId) : undefined,
        cooperatingDepartmentIds: task.cooperatingDepartments?.map((d) => String(d.id)) ?? [],
        frequency: task.frequency,
        deadline: task.deadline ? task.deadline.slice(0, 16) : '',
        reminderBefore: task.reminderBefore ?? 0,
        status: task.status as TaskStatus,
      })
    }
  }, [open, task])

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      tasksService.update(task.id, {
        ...data,
        leadDepartmentId: data.leadDepartmentId ? Number(data.leadDepartmentId) : undefined,
        cooperatingDepartmentIds: data.cooperatingDepartmentIds?.map(Number) ?? [],
        deadline: data.deadline || undefined,
      }),
    onSuccess: () => {
      toast.success('Cập nhật công việc thành công')
      onSuccess()
    },
    onError: () => toast.error('Không thể cập nhật công việc'),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa công việc</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên công việc *</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nội dung chi tiết</FormLabel>
                  <FormControl><Textarea rows={3} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="linhVuc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lĩnh vực</FormLabel>
                  <FormControl><Input placeholder="VD: An ninh trật tự, Phòng chống tội phạm..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="leadDepartmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Đơn vị chủ trì</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Chọn đơn vị" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments?.map((d) => (
                          <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="cooperatingDepartmentIds"
              render={({ field }) => {
                const leadId = form.watch('leadDepartmentId')
                const available = departments?.filter((d) => String(d.id) !== leadId) ?? []
                const selected: string[] = field.value ?? []
                const toggle = (id: string) =>
                  field.onChange(
                    selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id],
                  )
                return (
                  <FormItem>
                    <FormLabel>Đơn vị phối hợp</FormLabel>
                    <div className="border rounded-md max-h-28 overflow-y-auto p-2 space-y-1">
                      {available.length === 0 ? (
                        <p className="text-xs text-muted-foreground px-1 py-1">Chưa có đơn vị nào</p>
                      ) : (
                        available.map((dept) => (
                          <label
                            key={dept.id}
                            className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 px-1 py-0.5 rounded text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={selected.includes(String(dept.id))}
                              onChange={() => toggle(String(dept.id))}
                              className="h-3.5 w-3.5 accent-primary"
                            />
                            {dept.name}
                          </label>
                        ))
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chu kỳ</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reminderBefore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nhắc trước (ngày)</FormLabel>
                    <FormControl><Input type="number" min={0} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hạn nộp báo cáo</FormLabel>
                  <FormControl><Input type="datetime-local" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
