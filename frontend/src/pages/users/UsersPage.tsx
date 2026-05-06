import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, KeyRound, ToggleLeft, ToggleRight, Search } from 'lucide-react'
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { usersService } from '@/services/users.service'
import { departmentsService } from '@/services/departments.service'
import { Role } from '@/types'
import type { User } from '@/types'

const ROLE_LABELS: Record<Role, string> = {
  [Role.ADMIN]: 'Quản trị hệ thống',
  [Role.UNIT_LEAD]: 'Phụ trách đơn vị',
  [Role.UNIT_MEMBER]: 'Cán bộ đơn vị',
}

const EMPTY_CREATE = { username: '', fullName: '', password: '', role: Role.UNIT_MEMBER, departmentId: '' }

export default function UsersPage() {
  const queryClient = useQueryClient()

  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState(EMPTY_CREATE)

  const [editUser, setEditUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({ fullName: '', role: Role.UNIT_MEMBER as Role, departmentId: '' })

  const [pwUser, setPwUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [search, setSearch] = useState('')

  const { data: users, isLoading } = useQuery({ queryKey: ['users'], queryFn: usersService.getAll })
  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: departmentsService.getAll })

  const createMutation = useMutation({
    mutationFn: () => usersService.create({
      ...createForm,
      departmentId: createForm.departmentId ? Number(createForm.departmentId) : undefined,
    }),
    onSuccess: () => {
      toast.success('Tạo tài khoản thành công')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setCreateOpen(false)
      setCreateForm(EMPTY_CREATE)
    },
    onError: () => toast.error('Không thể tạo tài khoản'),
  })

  const editMutation = useMutation({
    mutationFn: () => {
      if (!editUser) return Promise.reject(new Error('No user selected'))
      return usersService.update(editUser.id, {
        fullName: editForm.fullName,
        role: editForm.role,
        departmentId: editForm.departmentId ? Number(editForm.departmentId) : undefined,
      })
    },
    onSuccess: () => {
      toast.success('Cập nhật tài khoản thành công')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setEditUser(null)
    },
    onError: () => toast.error('Không thể cập nhật tài khoản'),
  })

  const toggleMutation = useMutation({
    mutationFn: (id: number) => usersService.toggleActive(id),
    onSuccess: () => {
      toast.success('Cập nhật thành công')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  const changePwMutation = useMutation({
    mutationFn: () => {
      if (!pwUser) return Promise.reject(new Error('No user selected'))
      return usersService.changePassword(pwUser.id, newPassword)
    },
    onSuccess: () => {
      toast.success('Đặt lại mật khẩu thành công')
      setPwUser(null)
      setNewPassword('')
    },
    onError: () => toast.error('Không thể đặt lại mật khẩu'),
  })

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return users
    return users?.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.department?.name ?? '').toLowerCase().includes(q),
    )
  }, [users, search])

  const openEdit = (u: User) => {
    setEditUser(u)
    setEditForm({
      fullName: u.fullName,
      role: u.role,
      departmentId: u.departmentId ? String(u.departmentId) : '',
    })
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-primary to-primary/80 px-6 py-5 flex items-center justify-between text-white shadow-md">
        <div>
          <h1 className="text-2xl font-bold">Quản lý tài khoản</h1>
          <p className="text-sm text-white/70 mt-0.5">
            {filtered ? `${filtered.length} tài khoản` : 'Quản lý người dùng và phân quyền hệ thống'}
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-white text-primary hover:bg-white/90 font-semibold shadow"
        >
          <Plus className="mr-2 h-4 w-4" /> Thêm tài khoản
        </Button>
      </div>

      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm theo tên, tài khoản, đơn vị..."
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
              <TableHead>Họ tên</TableHead>
              <TableHead>Tên đăng nhập</TableHead>
              <TableHead>Phân quyền</TableHead>
              <TableHead>Đơn vị</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-36">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                  {search ? 'Không tìm thấy tài khoản nào phù hợp' : 'Chưa có tài khoản nào'}
                </TableCell>
              </TableRow>
            ) : filtered?.map((u) => (
              <TableRow key={u.id} className="h-auto">
                <TableCell className="font-medium py-2">{u.fullName}</TableCell>
                <TableCell className="font-mono py-2">{u.username}</TableCell>
                <TableCell className="py-2">
                  <Badge variant={u.role === Role.ADMIN ? 'default' : 'secondary'}>
                    {ROLE_LABELS[u.role]}
                  </Badge>
                </TableCell>
                <TableCell className="py-2">{u.department?.name ?? '—'}</TableCell>
                <TableCell className="py-2">
                  <Badge variant={u.isActive ? 'outline' : 'secondary'}>
                    {u.isActive ? 'Hoạt động' : 'Vô hiệu'}
                  </Badge>
                </TableCell>
                <TableCell className="py-2">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="Chỉnh sửa" title="Chỉnh sửa" onClick={() => openEdit(u)}>
                      <Pencil className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="Đặt lại mật khẩu" title="Đặt lại mật khẩu" onClick={() => { setPwUser(u); setNewPassword('') }}>
                      <KeyRound className="h-4 w-4 text-amber-600" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label={u.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'} title={u.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'} onClick={() => toggleMutation.mutate(u.id)}>
                      {u.isActive
                        ? <ToggleRight className="h-5 w-5 text-green-600" />
                        : <ToggleLeft className="h-5 w-5 text-muted-foreground" />}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Tạo tài khoản */}
      <Dialog open={createOpen} onOpenChange={(o) => { setCreateOpen(o); if (!o) setCreateForm(EMPTY_CREATE) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tạo tài khoản mới</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tên đăng nhập *</Label>
                <Input value={createForm.username} onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })} />
              </div>
              <div>
                <Label>Mật khẩu *</Label>
                <Input type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Họ và tên *</Label>
              <Input value={createForm.fullName} onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Phân quyền</Label>
                <Select value={createForm.role} onValueChange={(v) => setCreateForm({ ...createForm, role: v as Role })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Đơn vị</Label>
                <Select value={createForm.departmentId} onValueChange={(v) => setCreateForm({ ...createForm, departmentId: v })}>
                  <SelectTrigger><SelectValue placeholder="Chọn đơn vị" /></SelectTrigger>
                  <SelectContent>
                    {departments?.map((d) => (
                      <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Hủy</Button>
            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !createForm.username || !createForm.password || !createForm.fullName}>
              {createMutation.isPending ? 'Đang tạo...' : 'Tạo tài khoản'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Chỉnh sửa tài khoản */}
      <Dialog open={!!editUser} onOpenChange={(o) => { if (!o) setEditUser(null) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Chỉnh sửa tài khoản — {editUser?.username}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Họ và tên *</Label>
              <Input value={editForm.fullName} onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Phân quyền</Label>
                <Select value={editForm.role} onValueChange={(v) => setEditForm({ ...editForm, role: v as Role })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Đơn vị</Label>
                <Select value={editForm.departmentId} onValueChange={(v) => setEditForm({ ...editForm, departmentId: v })}>
                  <SelectTrigger><SelectValue placeholder="Chọn đơn vị" /></SelectTrigger>
                  <SelectContent>
                    {departments?.map((d) => (
                      <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>Hủy</Button>
            <Button onClick={() => editMutation.mutate()} disabled={editMutation.isPending || !editForm.fullName}>
              {editMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Đặt lại mật khẩu */}
      <Dialog open={!!pwUser} onOpenChange={(o) => { if (!o) { setPwUser(null); setNewPassword('') } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Đặt lại mật khẩu — {pwUser?.username}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Nhập mật khẩu mới cho tài khoản này. Người dùng sẽ cần dùng mật khẩu mới khi đăng nhập lần tiếp theo.</p>
            <div>
              <Label>Mật khẩu mới *</Label>
              <Input
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPwUser(null)}>Hủy</Button>
            <Button onClick={() => changePwMutation.mutate()} disabled={changePwMutation.isPending || newPassword.length < 6}>
              {changePwMutation.isPending ? 'Đang đặt lại...' : 'Xác nhận'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
