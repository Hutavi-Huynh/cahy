import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, ToggleLeft, ToggleRight, Pencil, Search } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { departmentsService } from '@/services/departments.service'

export default function DepartmentsPage() {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState({ code: '', name: '', description: '' })
  const [search, setSearch] = useState('')

  const { data: departments, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsService.getAll,
  })

  const createMutation = useMutation({
    mutationFn: () => departmentsService.create(form),
    onSuccess: () => {
      toast.success('Tạo đơn vị thành công')
      queryClient.invalidateQueries({ queryKey: ['departments'] })
      setCreateOpen(false)
      setForm({ code: '', name: '', description: '' })
    },
    onError: () => toast.error('Không thể tạo đơn vị'),
  })

  const updateMutation = useMutation({
    mutationFn: () => departmentsService.update(editId!, form),
    onSuccess: () => {
      toast.success('Cập nhật đơn vị thành công')
      queryClient.invalidateQueries({ queryKey: ['departments'] })
      setCreateOpen(false)
      setEditId(null)
      setForm({ code: '', name: '', description: '' })
    },
    onError: () => toast.error('Không thể cập nhật đơn vị'),
  })

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return departments
    return departments?.filter(
      (d) =>
        d.code.toLowerCase().includes(q) ||
        d.name.toLowerCase().includes(q) ||
        (d.description ?? '').toLowerCase().includes(q),
    )
  }, [departments, search])

  const toggleMutation = useMutation({
    mutationFn: (id: number) => departmentsService.toggleActive(id),
    onSuccess: () => {
      toast.success('Cập nhật thành công')
      queryClient.invalidateQueries({ queryKey: ['departments'] })
    },
  })

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-primary to-primary/80 px-6 py-5 flex items-center justify-between text-white shadow-md">
        <div>
          <h1 className="text-2xl font-bold">Quản lý đơn vị</h1>
          <p className="text-sm text-white/70 mt-0.5">
            {filtered ? `${filtered.length} đơn vị` : 'Quản lý các phòng ban trong hệ thống'}
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-white text-primary hover:bg-white/90 font-semibold shadow"
        >
          <Plus className="mr-2 h-4 w-4" /> Thêm đơn vị
        </Button>
      </div>

      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm theo mã, tên, mô tả..."
          className="pl-9 h-10 rounded-lg"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <span className="text-xs">✕</span>
          </button>
        )}
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã đơn vị</TableHead>
              <TableHead>Tên đơn vị</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-28">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-20">
                  {search ? 'Không tìm thấy đơn vị nào phù hợp' : 'Chưa có đơn vị nào'}
                </TableCell>
              </TableRow>
            ) : (
              filtered?.map((dept) => (
                <TableRow key={dept.id} className="h-auto">
                  <TableCell className="font-mono font-medium py-2">{dept.code}</TableCell>
                  <TableCell className="py-2">{dept.name}</TableCell>
                  <TableCell className="text-muted-foreground py-2">{dept.description ?? '—'}</TableCell>
                  <TableCell className="py-2">
                    <Badge className="shrink-0 grow-0 whitespace-nowrap" variant={dept.isActive ? 'default' : 'secondary'}>
                      {dept.isActive ? 'Hoạt động' : 'Vô hiệu'}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex gap-1 py-2">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setEditId(dept.id)
                        setForm({ code: dept.code, name: dept.name, description: dept.description ?? '' })
                        setCreateOpen(true)
                      }}
                      className="h-8 w-8 p-0 [&_svg]:size-4"
                      title="Chỉnh sửa"
                    >
                      <Pencil className="text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => toggleMutation.mutate(dept.id)}
                      className="h-8 w-8 p-0 [&_svg]:size-5"
                      title={dept.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                    >
                      {dept.isActive ? (
                        <ToggleRight className="text-green-600" />
                      ) : (
                        <ToggleLeft className="text-muted-foreground" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={createOpen} onOpenChange={(open) => {
        setCreateOpen(open)
        if (!open) {
          setEditId(null)
          setForm({ code: '', name: '', description: '' })
        }
      }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editId ? 'Chỉnh sửa đơn vị' : 'Thêm đơn vị mới'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Mã đơn vị *</Label>
              <Input
                placeholder="VD: PV01"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                disabled={editId !== null}
              />
            </div>
            <div>
              <Label>Tên đơn vị *</Label>
              <Input
                placeholder="VD: Phòng PV01"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Mô tả</Label>
              <Textarea
                placeholder="Mô tả chức năng đơn vị..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Hủy</Button>
            {editId ? (
              <Button
                onClick={() => updateMutation.mutate()}
                disabled={updateMutation.isPending || !form.code || !form.name}
              >
                {updateMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật đơn vị'}
              </Button>
            ) : (
              <Button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending || !form.code || !form.name}
              >
                {createMutation.isPending ? 'Đang tạo...' : 'Tạo đơn vị'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
