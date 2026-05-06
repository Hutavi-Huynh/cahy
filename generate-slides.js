// generate-slides.js  –  node generate-slides.js
const PptxGenJS = require('pptxgenjs')
const pptx = new PptxGenJS()

// ── Design tokens ─────────────────────────────────────────
const C = {
  navy:    '0F2244',
  blue:    '1A3A6E',
  accent:  'C8A43A',
  gold:    'F0C040',
  white:   'FFFFFF',
  light:   'E8EEF6',
  bg:      'F8FAFC',
  border:  'D1DAE8',
  gray:    '6B7280',
  green:   '16A34A',
  red:     'DC2626',
  yellow:  'D97706',
  indigo:  '1D4ED8',
}

pptx.layout   = 'LAYOUT_WIDE'   // 13.33 × 7.5 in
pptx.author   = 'CAHY System'
pptx.subject  = 'Demo Presentation'
pptx.title    = 'CAHY – Hệ thống Quản lý Nhiệm vụ Công tác'

// ── Helpers ───────────────────────────────────────────────
const W = 13.33   // slide width  (inches)
const H = 7.5     // slide height

/** Standard header bar */
function addHeader(slide, icon, title, badge = null) {
  // Navy bar
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: W, h: 0.75,
    fill: { color: C.navy },
    line: { none: true },
  })
  // Icon + title
  slide.addText(`${icon}  ${title}`, {
    x: 0.35, y: 0, w: badge ? W - 1.8 : W - 0.5, h: 0.75,
    color: C.white, fontSize: 20, bold: true, valign: 'middle',
  })
  if (badge) {
    slide.addShape(pptx.ShapeType.roundRect, {
      x: W - 1.6, y: 0.18, w: 1.3, h: 0.38,
      fill: { color: 'C8A43A', transparency: 75 },
      line: { color: C.accent, width: 1 },
      rectRadius: 0.12,
    })
    slide.addText(badge, {
      x: W - 1.6, y: 0.18, w: 1.3, h: 0.38,
      color: C.accent, fontSize: 10, bold: true, align: 'center', valign: 'middle',
    })
  }
  // Light background for body
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0.75, w: W, h: H - 0.75,
    fill: { color: 'F8FAFC' },
    line: { none: true },
  })
}

/** White card with optional left border color */
function addCard(slide, { x, y, w, h, borderColor = null, fillColor = C.white } = {}) {
  slide.addShape(pptx.ShapeType.rect, {
    x, y, w, h,
    fill: { color: fillColor },
    line: { color: C.border, width: 0.75 },
    shadow: { type: 'outer', blur: 4, offset: 2, angle: 45, color: '00000010' },
    rectRadius: 0.08,
  })
  if (borderColor) {
    slide.addShape(pptx.ShapeType.rect, {
      x, y, w: 0.055, h,
      fill: { color: borderColor },
      line: { none: true },
      rectRadius: 0,
    })
  }
}

/** Small section label */
function sectionLabel(slide, text, x, y) {
  slide.addText(text.toUpperCase(), {
    x, y, w: 5, h: 0.22,
    color: C.gray, fontSize: 8, bold: true, charSpacing: 1.5,
  })
}

/** Status badge box */
function statusBadge(slide, text, x, y, type = 'pending') {
  const map = {
    pending:     { fill: 'F3F4F6', text: '6B7280' },
    in_progress: { fill: 'FEF3C7', text: 'D97706' },
    completed:   { fill: 'DCFCE7', text: '16A34A' },
    overdue:     { fill: 'FEE2E2', text: 'DC2626' },
  }
  const s = map[type] || map.pending
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w: 1.25, h: 0.24,
    fill: { color: s.fill },
    line: { none: true },
    rectRadius: 0.1,
  })
  slide.addText(`● ${text}`, {
    x, y, w: 1.25, h: 0.24,
    color: s.text, fontSize: 8.5, bold: true, align: 'center', valign: 'middle',
  })
}

// ═══════════════════════════════════════════════════════════
// SLIDE 1 – COVER
// ═══════════════════════════════════════════════════════════
;(() => {
  const s = pptx.addSlide()

  // Deep navy gradient background
  s.background = { color: C.navy }

  // Gold accent strip (top)
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: W, h: 0.06,
    fill: { color: C.accent },
    line: { none: true },
  })
  // Gold accent strip (bottom)
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: H - 0.06, w: W, h: 0.06,
    fill: { color: C.accent },
    line: { none: true },
  })

  // Large shield emoji
  s.addText('🛡️', {
    x: 0, y: 1.2, w: W, h: 1.1,
    fontSize: 72, align: 'center',
  })

  // Small label
  s.addText('HỆ THỐNG NỘI BỘ LAN', {
    x: 0, y: 2.35, w: W, h: 0.28,
    color: 'AABBD4', fontSize: 10, bold: true, align: 'center', charSpacing: 4,
  })

  // Main title
  s.addText('CAHY', {
    x: 0, y: 2.62, w: W, h: 0.88,
    color: C.gold, fontSize: 64, bold: true, align: 'center',
    glow: { size: 12, color: C.accent, opacity: 0.3 },
  })

  // Subtitle
  s.addText('Hệ thống Quản lý Nhiệm vụ Công tác\nCông an tỉnh', {
    x: 1, y: 3.52, w: W - 2, h: 0.72,
    color: 'AABBD4', fontSize: 18, align: 'center', lineSpacingMultiple: 1.35,
  })

  // Tagline pill
  s.addShape(pptx.ShapeType.roundRect, {
    x: 4.5, y: 4.42, w: 4.33, h: 0.42,
    fill: { color: C.navy },
    line: { color: C.accent, width: 1.5 },
    rectRadius: 0.18,
  })
  s.addText('Demo sản phẩm  ·  2026', {
    x: 4.5, y: 4.42, w: 4.33, h: 0.42,
    color: C.gold, fontSize: 11, bold: true, align: 'center', valign: 'middle', charSpacing: 1,
  })

  // Footer icons
  const icons = [
    '🖥️  Nội bộ mạng LAN',
    '🔒  Phân quyền 3 cấp',
    '📊  Báo cáo tự động',
    '📎  Đính kèm tài liệu',
  ]
  icons.forEach((txt, i) => {
    s.addText(txt, {
      x: 0.3 + i * 3.18, y: H - 0.55, w: 3.1, h: 0.35,
      color: '7A91B0', fontSize: 10, align: 'center',
    })
  })
})()

// ═══════════════════════════════════════════════════════════
// SLIDE 2 – BỐI CẢNH & VẤN ĐỀ
// ═══════════════════════════════════════════════════════════
;(() => {
  const s = pptx.addSlide()
  addHeader(s, '🎯', 'Bối cảnh & Vấn đề cần giải quyết')

  // Left card – thực trạng
  addCard(s, { x: 0.3, y: 0.9, w: 6.1, h: 5.8, borderColor: C.red })
  s.addText('❌  THỰC TRẠNG TRƯỚC ĐÂY', {
    x: 0.45, y: 0.95, w: 5.7, h: 0.3,
    color: C.red, fontSize: 9.5, bold: true, charSpacing: 1,
  })

  const problems = [
    ['📄', 'Phân công bằng văn bản giấy', 'Khó tra cứu, dễ thất lạc, chậm cập nhật tiến độ'],
    ['📞', 'Đôn đốc qua điện thoại / họp trực tiếp', 'Tốn thời gian, không lưu vết lịch sử'],
    ['📊', 'Tổng hợp báo cáo thủ công từng phòng', 'Mất nhiều giờ mỗi lần tổng hợp số liệu'],
    ['⏰', 'Không phát hiện sớm nhiệm vụ quá hạn', 'Không có hệ thống cảnh báo tự động'],
  ]
  problems.forEach(([icon, title, sub], i) => {
    const yRow = 1.4 + i * 1.1
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.45, y: yRow, w: 5.8, h: 0.95,
      fill: { color: 'FFF5F5' }, line: { color: 'FECACA', width: 0.75 }, rectRadius: 0.07,
    })
    s.addText(icon, { x: 0.6, y: yRow + 0.1, w: 0.5, h: 0.75, fontSize: 22, valign: 'middle' })
    s.addText(title, { x: 1.15, y: yRow + 0.08, w: 5.0, h: 0.3, color: C.navy, fontSize: 11, bold: true })
    s.addText(sub,   { x: 1.15, y: yRow + 0.38, w: 5.0, h: 0.5, color: C.gray, fontSize: 9.5, lineSpacingMultiple: 1.2 })
  })

  // Right card – giải pháp
  addCard(s, { x: 6.93, y: 0.9, w: 6.1, h: 5.0, borderColor: C.green })
  s.addText('✅  GIẢI PHÁP CAHY MANG LẠI', {
    x: 7.08, y: 0.95, w: 5.7, h: 0.3,
    color: C.green, fontSize: 9.5, bold: true, charSpacing: 1,
  })

  const solutions = [
    ['💻', 'Phân công nhiệm vụ trực tuyến', 'Giao việc, theo dõi tiến độ ngay trên hệ thống'],
    ['📬', 'Thông báo & nhắc nhở tự động', 'Cảnh báo đến hạn trước N ngày, phát hiện quá hạn'],
    ['📈', 'Báo cáo thống kê tức thời', 'Số liệu theo đơn vị, theo trạng thái, xuất Excel 1 click'],
    ['🔒', 'Bảo mật nội bộ LAN', 'Không cần Internet, không rò rỉ dữ liệu ra ngoài'],
  ]
  solutions.forEach(([icon, title, sub], i) => {
    const yRow = 1.4 + i * 1.05
    s.addShape(pptx.ShapeType.roundRect, {
      x: 7.08, y: yRow, w: 5.8, h: 0.9,
      fill: { color: 'F0FDF4' }, line: { color: 'BBF7D0', width: 0.75 }, rectRadius: 0.07,
    })
    s.addText(icon,  { x: 7.23, y: yRow + 0.08, w: 0.5, h: 0.75, fontSize: 20, valign: 'middle' })
    s.addText(title, { x: 7.78, y: yRow + 0.06, w: 5.0, h: 0.28, color: C.navy, fontSize: 11, bold: true })
    s.addText(sub,   { x: 7.78, y: yRow + 0.34, w: 5.0, h: 0.48, color: C.gray, fontSize: 9.5 })
  })

  // Phạm vi box
  s.addShape(pptx.ShapeType.roundRect, {
    x: 6.93, y: 6.05, w: 6.1, h: 0.65,
    fill: { color: C.navy }, line: { none: true }, rectRadius: 0.08,
  })
  s.addText('🏢  Công an tỉnh  ·  16 phòng ban  ·  30+ cán bộ  ·  Vận hành trên mạng LAN nội bộ', {
    x: 7.03, y: 6.05, w: 5.9, h: 0.65,
    color: 'AABBD4', fontSize: 10, align: 'center', valign: 'middle',
  })
})()

// ═══════════════════════════════════════════════════════════
// SLIDE 3 – KIẾN TRÚC HỆ THỐNG
// ═══════════════════════════════════════════════════════════
;(() => {
  const s = pptx.addSlide()
  addHeader(s, '🏗️', 'Tổng quan kiến trúc hệ thống')

  // Architecture boxes
  const boxes = [
    { label: 'Mạng LAN\nNội bộ', chips: ['Không Internet', 'Bảo mật cao'], color: '065F46', x: 0.25, w: 2.0 },
    { label: 'Giao diện\n(Frontend)', chips: ['React 19', 'TypeScript', 'Vite', 'shadcn/ui', 'Tailwind', 'React Query'], color: '1E3A5F', x: 2.95, w: 2.9 },
    { label: 'Máy chủ\n(Backend)', chips: ['NestJS 11', 'TypeScript', 'TypeORM', 'JWT Auth', 'REST API', 'Swagger'], color: C.navy, x: 6.55, w: 2.9 },
    { label: 'Cơ sở\nDữ liệu', chips: ['PostgreSQL', '8 entities'], color: '1F2937', x: 10.15, w: 2.0 },
  ]

  boxes.forEach(({ label, chips, color, x, w }) => {
    s.addShape(pptx.ShapeType.roundRect, {
      x, y: 0.9, w, h: 1.7,
      fill: { color }, line: { none: true }, rectRadius: 0.1,
    })
    s.addText(label, {
      x: x + 0.1, y: 0.95, w: w - 0.2, h: 0.55,
      color: C.gold, fontSize: 11, bold: true, align: 'center',
    })
    // chips
    let cx = x + 0.12, cy = 1.55, maxW = w - 0.24
    chips.forEach((chip) => {
      const cw = Math.max(chip.length * 0.08 + 0.22, 0.7)
      if (cx + cw > x + maxW + 0.12) { cx = x + 0.12; cy += 0.27 }
      s.addShape(pptx.ShapeType.roundRect, {
        x: cx, y: cy, w: cw, h: 0.22,
        fill: { color: 'FFFFFF', transparency: 85 },
        line: { color: 'FFFFFF', transparency: 70, width: 0.5 },
        rectRadius: 0.08,
      })
      s.addText(chip, { x: cx, y: cy, w: cw, h: 0.22, color: 'DDDDDD', fontSize: 7.5, align: 'center', valign: 'middle' })
      cx += cw + 0.06
    })
  })

  // Arrows between boxes
  const arrowX = [2.25, 5.85, 9.45]
  arrowX.forEach(ax => {
    s.addText('⟺', { x: ax, y: 1.15, w: 0.7, h: 0.65, fontSize: 20, color: '94A3B8', align: 'center' })
  })

  // Modules section label
  s.addShape(pptx.ShapeType.line, { x: 0.3, y: 2.82, w: 5.4, h: 0, line: { color: C.border, width: 0.75 } })
  s.addText('CÁC MODULE CHỨC NĂNG', {
    x: 5.7, y: 2.72, w: 2.93, h: 0.24,
    color: C.gray, fontSize: 8, bold: true, align: 'center', charSpacing: 1.5,
  })
  s.addShape(pptx.ShapeType.line, { x: 8.63, y: 2.82, w: 4.4, h: 0, line: { color: C.border, width: 0.75 } })

  const mods = [
    { icon: '🔐', name: 'Xác thực', sub: 'Đăng nhập JWT', color: C.navy },
    { icon: '📋', name: 'Nhiệm vụ', sub: 'CRUD + phân công', color: C.indigo },
    { icon: '🏢', name: 'Đơn vị', sub: 'Quản lý phòng ban', color: '7C3AED' },
    { icon: '👥', name: 'Tài khoản', sub: 'Người dùng & quyền', color: '0891B2' },
    { icon: '📊', name: 'Báo cáo', sub: 'Thống kê + Excel', color: C.green },
    { icon: '🔔', name: 'Thông báo', sub: 'Cảnh báo tự động', color: C.yellow },
    { icon: '📝', name: 'Kết quả', sub: 'Báo cáo tiến độ', color: C.red },
    { icon: '🗂️', name: 'Giải trình', sub: 'Xử lý quá hạn', color: 'B45309' },
  ]
  mods.forEach(({ icon, name, sub, color }, i) => {
    const mx = 0.25 + i * 1.635
    s.addShape(pptx.ShapeType.rect, {
      x: mx, y: 2.95, w: 1.57, h: 1.75,
      fill: { color: C.white }, line: { color: C.border, width: 0.75 },
    })
    s.addShape(pptx.ShapeType.rect, {
      x: mx, y: 2.95, w: 1.57, h: 0.06,
      fill: { color }, line: { none: true },
    })
    s.addText(icon, { x: mx, y: 3.06, w: 1.57, h: 0.6, fontSize: 26, align: 'center' })
    s.addText(name, { x: mx, y: 3.68, w: 1.57, h: 0.3, color: C.navy, fontSize: 10.5, bold: true, align: 'center' })
    s.addText(sub,  { x: mx, y: 3.99, w: 1.57, h: 0.64, color: C.gray, fontSize: 8.5, align: 'center', lineSpacingMultiple: 1.2 })
  })

  // Stats strip
  const stats = [
    { n: '16', lbl: 'Phòng ban', color: C.indigo },
    { n: '30+', lbl: 'Tài khoản', color: '7C3AED' },
    { n: '3', lbl: 'Cấp phân quyền', color: C.green },
    { n: '8', lbl: 'Bảng dữ liệu', color: C.yellow },
  ]
  stats.forEach(({ n, lbl, color }, i) => {
    const sx = 0.25 + i * 3.27
    s.addShape(pptx.ShapeType.roundRect, {
      x: sx, y: 4.9, w: 3.05, h: 0.75,
      fill: { color: C.white }, line: { color: C.border, width: 0.75 }, rectRadius: 0.08,
    })
    s.addText(n, {
      x: sx + 0.1, y: 4.92, w: 0.9, h: 0.7,
      color, fontSize: 28, bold: true, align: 'center', valign: 'middle',
    })
    s.addText(lbl, {
      x: sx + 1.0, y: 4.92, w: 1.95, h: 0.7,
      color: C.gray, fontSize: 11, valign: 'middle',
    })
  })
})()

// ═══════════════════════════════════════════════════════════
// SLIDE 4 – PHÂN QUYỀN
// ═══════════════════════════════════════════════════════════
;(() => {
  const s = pptx.addSlide()
  addHeader(s, '🔐', 'Phân quyền người dùng', '3 cấp độ')

  const roles = [
    {
      badge: 'QUẢN TRỊ HỆ THỐNG', icon: '👑', title: 'ADMIN',
      sub: 'Lãnh đạo / PV01 / Ban giám đốc',
      fill: C.navy, titleColor: C.gold, textColor: 'CCDDEE',
      perms: [
        'Tạo, chỉnh sửa, xóa nhiệm vụ',
        'Phân công đơn vị chủ trì & phối hợp',
        'Xem toàn bộ nhiệm vụ mọi đơn vị',
        'Quản lý tài khoản người dùng',
        'Quản lý danh mục đơn vị',
        'Xem báo cáo thống kê toàn hệ thống',
        'Xuất báo cáo Excel',
        'Gửi thông báo hệ thống',
      ],
      note: null,
    },
    {
      badge: 'PHỤ TRÁCH ĐƠN VỊ', icon: '🎖️', title: 'TRƯỞNG ĐƠN VỊ',
      sub: 'Trưởng phòng / Phụ trách đơn vị',
      fill: '1E3A5F', titleColor: '60A5FA', textColor: C.white,
      perms: [
        'Xem nhiệm vụ của phòng mình',
        'Xem nhiệm vụ phòng mình phối hợp',
        'Gửi báo cáo kết quả thực hiện',
        'Đính kèm file báo cáo',
        'Nộp giải trình khi quá hạn',
        'Xem thông báo liên quan',
      ],
      note: '⚠️ Chỉ xem được nhiệm vụ của phòng ban mình, không thấy dữ liệu phòng khác',
    },
    {
      badge: 'CÁN BỘ ĐƠN VỊ', icon: '👤', title: 'CÁN BỘ',
      sub: 'Cán bộ thuộc các phòng ban',
      fill: C.white, titleColor: C.navy, textColor: C.navy,
      perms: [
        'Xem nhiệm vụ của phòng mình',
        'Xem nhiệm vụ phòng mình phối hợp',
        'Gửi báo cáo kết quả thực hiện',
        'Đính kèm file minh chứng',
        'Nộp giải trình khi quá hạn',
        'Xem thông báo cá nhân',
      ],
      note: 'ℹ️ Hệ thống có thể mở rộng phân cấp trong nội bộ phòng ban',
    },
  ]

  roles.forEach(({ badge, icon, title, sub, fill, titleColor, textColor, perms, note }, i) => {
    const x = 0.3 + i * 4.35
    const isDark = fill !== C.white
    s.addShape(pptx.ShapeType.roundRect, {
      x, y: 0.88, w: 4.1, h: note ? 5.55 : 5.55,
      fill: { color: fill }, line: { color: C.border, width: 1 }, rectRadius: 0.1,
    })
    // Badge pill
    s.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.15, y: 1.05, w: 3.8, h: 0.28,
      fill: isDark ? { color: 'FFFFFF', transparency: 87 } : { color: 'EFF6FF' },
      line: { none: true }, rectRadius: 0.1,
    })
    s.addText(badge, {
      x: x + 0.15, y: 1.05, w: 3.8, h: 0.28,
      color: isDark ? C.gold : C.indigo, fontSize: 9, bold: true, align: 'center', valign: 'middle',
    })
    s.addText(icon,  { x, y: 1.38, w: 4.1, h: 0.55, fontSize: 30, align: 'center' })
    s.addText(title, { x, y: 1.93, w: 4.1, h: 0.38, color: titleColor, fontSize: 15, bold: true, align: 'center' })
    s.addText(sub,   { x, y: 2.31, w: 4.1, h: 0.3,  color: isDark ? 'AABBD4' : C.gray, fontSize: 9, align: 'center' })

    // Separator
    s.addShape(pptx.ShapeType.line, {
      x: x + 0.2, y: 2.68, w: 3.7, h: 0,
      line: isDark ? { color: 'FFFFFF', transparency: 85, width: 0.75 } : { color: C.border, width: 0.75 },
    })

    // Perms
    perms.forEach((p, pi) => {
      s.addText(`✓  ${p}`, {
        x: x + 0.2, y: 2.78 + pi * 0.33, w: 3.7, h: 0.3,
        color: textColor, fontSize: 9.5,
      })
    })

    // Note
    if (note) {
      s.addShape(pptx.ShapeType.roundRect, {
        x: x + 0.15, y: 5.83, w: 3.8, h: 0.48,
        fill: isDark ? { color: 'FFFFFF', transparency: 93 } : { color: 'EFF6FF' },
        line: isDark ? { color: 'FFFFFF', transparency: 87, width: 0.75 } : { color: 'BFDBFE', width: 0.75 }, rectRadius: 0.07,
      })
      s.addText(note, {
        x: x + 0.2, y: 5.85, w: 3.7, h: 0.44,
        color: isDark ? '93C5FD' : C.indigo, fontSize: 8.5, lineSpacingMultiple: 1.2, valign: 'middle',
      })
    }
  })

  // Bottom security note
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.3, y: 6.62, w: W - 0.6, h: 0.62,
    fill: { color: C.navy }, line: { none: true }, rectRadius: 0.08,
  })
  s.addText('🔑  Bảo mật đăng nhập:  JWT Token  ·  Mã hoá mật khẩu bcrypt  ·  Ghi log lịch sử đăng nhập (IP, thời gian, thành công/thất bại)  ·  Tự động lọc dữ liệu theo phòng ban sau đăng nhập', {
    x: 0.5, y: 6.62, w: W - 1.0, h: 0.62,
    color: '7A91B0', fontSize: 9.5, valign: 'middle', align: 'center',
  })
})()

// ═══════════════════════════════════════════════════════════
// SLIDE 5 – DASHBOARD
// ═══════════════════════════════════════════════════════════
;(() => {
  const s = pptx.addSlide()
  addHeader(s, '📊', 'Dashboard – Trang Tổng quan')

  // Left panel
  addCard(s, { x: 0.25, y: 0.9, w: 5.5, h: 1.55, borderColor: C.navy })
  s.addText('MỤC ĐÍCH', { x: 0.42, y: 0.96, w: 5.1, h: 0.22, color: C.gray, fontSize: 8, bold: true, charSpacing: 1 })
  s.addText('Trang đầu tiên sau khi đăng nhập. Cung cấp cái nhìn tổng thể về tình hình nhiệm vụ công tác và các việc cần xử lý gần đây.', {
    x: 0.42, y: 1.2, w: 5.1, h: 0.9,
    color: C.gray, fontSize: 10.5, lineSpacingMultiple: 1.4,
  })

  // Role display
  addCard(s, { x: 0.25, y: 2.58, w: 5.5, h: 2.05 })
  s.addText('HIỂN THỊ THEO PHÂN QUYỀN', { x: 0.42, y: 2.64, w: 5.1, h: 0.22, color: C.gray, fontSize: 8, bold: true, charSpacing: 1 })

  const roleRows = [
    { icon: '👑', role: 'Admin', desc: '4 thẻ thống kê toàn hệ thống + danh sách công việc gần đây', fill: 'EFF6FF' },
    { icon: '🎖️', role: 'Cán bộ / Trưởng đơn vị', desc: 'Danh sách 5 nhiệm vụ gần đây nhất của phòng mình', fill: 'F8FAFC' },
  ]
  roleRows.forEach(({ icon, role, desc, fill }, i) => {
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.4, y: 2.95 + i * 0.82, w: 5.2, h: 0.72,
      fill: { color: fill }, line: { color: C.border, width: 0.5 }, rectRadius: 0.06,
    })
    s.addText(icon, { x: 0.5, y: 2.97 + i * 0.82, w: 0.45, h: 0.68, fontSize: 18, valign: 'middle' })
    s.addText(role, { x: 0.98, y: 3.0 + i * 0.82, w: 4.5, h: 0.26, color: C.navy, fontSize: 10.5, bold: true })
    s.addText(desc, { x: 0.98, y: 3.26 + i * 0.82, w: 4.5, h: 0.36, color: C.gray, fontSize: 9.5 })
  })

  // Stat cards (Admin)
  addCard(s, { x: 0.25, y: 4.75, w: 5.5, h: 1.9 })
  s.addText('THẺ THỐNG KÊ (Admin)', { x: 0.42, y: 4.81, w: 5.1, h: 0.22, color: C.gray, fontSize: 8, bold: true, charSpacing: 1 })

  const statCards = [
    { n: '21', lbl: 'Tổng công việc', fill: 'EFF6FF', color: C.indigo },
    { n: '8',  lbl: 'Đang thực hiện', fill: 'FEF9C3', color: C.yellow },
    { n: '5',  lbl: 'Hoàn thành', fill: 'F0FDF4', color: C.green },
    { n: '3',  lbl: 'Quá hạn', fill: 'FEF2F2', color: C.red },
  ]
  statCards.forEach(({ n, lbl, fill, color }, i) => {
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.38 + i * 1.32, y: 5.1, w: 1.2, h: 1.38,
      fill: { color: fill }, line: { color: C.border, width: 0.75 }, rectRadius: 0.08,
    })
    s.addText(n,   { x: 0.38 + i * 1.32, y: 5.18, w: 1.2, h: 0.6,  color, fontSize: 28, bold: true, align: 'center' })
    s.addText(lbl, { x: 0.38 + i * 1.32, y: 5.78, w: 1.2, h: 0.6,  color: C.gray, fontSize: 9, align: 'center', lineSpacingMultiple: 1.2 })
  })

  // Right panel – recent tasks
  addCard(s, { x: 6.05, y: 0.9, w: 7.0, h: 5.75 })
  s.addText('Công việc gần đây', { x: 6.2, y: 0.96, w: 6.7, h: 0.3, color: C.navy, fontSize: 12, bold: true })

  const recentTasks = [
    { title: 'Tuần tra kiểm soát giao thông QL1A', dept: 'P.CS Giao thông · Hạn: 09/05/2026', st: 'in_progress' },
    { title: 'Kiểm tra PCCC tại các cơ sở kinh doanh', dept: 'P.PCCC · Hạn: 14/05/2026', st: 'in_progress' },
    { title: 'Điều tra vụ trộm cắp tại phường Hòa Phú', dept: 'P.CS Hình sự · Hạn: 13/05/2026', st: 'in_progress' },
    { title: 'Báo cáo tổng hợp tình hình tệ nạn Q.II', dept: 'P.CS ATXH · Hạn: 03/05/2026', st: 'overdue' },
    { title: 'Điều tra vụ cố ý gây thương tích Tân Bình', dept: 'P.CS Hình sự · Hạn: 01/05/2026', st: 'completed' },
  ]
  recentTasks.forEach(({ title, dept, st }, i) => {
    const ty = 1.38 + i * 0.99
    s.addShape(pptx.ShapeType.roundRect, {
      x: 6.15, y: ty, w: 6.8, h: 0.88,
      fill: { color: C.white }, line: { color: C.border, width: 0.75 }, rectRadius: 0.07,
    })
    s.addText(title, { x: 6.28, y: ty + 0.08, w: 5.2, h: 0.32, color: C.navy, fontSize: 10.5, bold: true })
    s.addText(dept,  { x: 6.28, y: ty + 0.41, w: 5.2, h: 0.28, color: C.gray, fontSize: 9 })
    statusBadge(s, { pending: 'Chưa TH', in_progress: 'Đang TH', completed: 'Hoàn thành', overdue: 'Quá hạn' }[st], 11.55, ty + 0.27, st)
  })
})()

// ═══════════════════════════════════════════════════════════
// SLIDE 6 – QUẢN LÝ NHIỆM VỤ
// ═══════════════════════════════════════════════════════════
;(() => {
  const s = pptx.addSlide()
  addHeader(s, '📋', 'Quản lý Nhiệm vụ Công tác', 'Chức năng cốt lõi')

  // Left: task info fields
  addCard(s, { x: 0.25, y: 0.9, w: 5.6, h: 2.9, borderColor: C.indigo })
  sectionLabel(s, 'Thông tin nhiệm vụ (Admin tạo)', 0.42, 0.96)
  const fields = [
    ['📌  Tên nhiệm vụ', 'Tiêu đề + nội dung chi tiết'],
    ['🏢  Đơn vị chủ trì', '1 đơn vị chịu trách nhiệm chính'],
    ['🤝  Phối hợp', 'Nhiều đơn vị hỗ trợ thực hiện'],
    ['📅  Chu kỳ', 'Một lần / Hàng tuần / Tháng / Quý'],
    ['⏰  Thời hạn', 'Ngày giờ cụ thể'],
    ['🔔  Nhắc trước', 'N ngày trước deadline'],
    ['🎯  Kết quả mong đợi', 'Mô tả tiêu chí hoàn thành'],
  ]
  fields.forEach(([label, val], i) => {
    s.addText(label, { x: 0.42, y: 1.22 + i * 0.33, w: 2.4, h: 0.3, color: C.gray, fontSize: 9.5 })
    s.addText(val,   { x: 2.85, y: 1.22 + i * 0.33, w: 2.85, h: 0.3, color: C.navy, fontSize: 9.5, bold: true })
  })

  // Filter section
  addCard(s, { x: 0.25, y: 3.95, w: 5.6, h: 1.3 })
  sectionLabel(s, 'Bộ lọc danh sách', 0.42, 4.01)
  const filters = ['🔍 Tìm theo tên / đơn vị', '📁 Lọc trạng thái', '🏢 Lọc theo đơn vị (Admin)', '📆 Lọc theo thời hạn']
  filters.forEach((f, i) => {
    const fx = 0.38 + (i % 2) * 2.78
    const fy = 4.28 + Math.floor(i / 2) * 0.42
    s.addShape(pptx.ShapeType.roundRect, {
      x: fx, y: fy, w: 2.6, h: 0.34, fill: { color: 'EFF6FF' }, line: { color: 'BFDBFE', width: 0.75 }, rectRadius: 0.07,
    })
    s.addText(f, { x: fx, y: fy, w: 2.6, h: 0.34, color: C.indigo, fontSize: 9, align: 'center', valign: 'middle', bold: true })
  })

  // Status flow
  addCard(s, { x: 0.25, y: 5.38, w: 5.6, h: 1.82 })
  sectionLabel(s, 'Vòng đời trạng thái', 0.42, 5.44)
  const flowSteps = [
    { label: '🆕\nChưa TH', fill: 'F3F4F6', text: '6B7280', x: 0.38 },
    { label: '▶️\nĐang TH', fill: 'DBEAFE', text: C.indigo, x: 1.78 },
    { label: '✅\nHoàn thành', fill: 'DCFCE7', text: C.green, x: 3.18 },
  ]
  flowSteps.forEach(({ label, fill, text, x }) => {
    s.addShape(pptx.ShapeType.roundRect, {
      x, y: 5.72, w: 1.22, h: 0.82, fill: { color: fill }, line: { color: C.border, width: 0.75 }, rectRadius: 0.08,
    })
    s.addText(label, { x, y: 5.72, w: 1.22, h: 0.82, color: text, fontSize: 9.5, bold: true, align: 'center', valign: 'middle', lineSpacingMultiple: 1.4 })
  })
  s.addText('→', { x: 1.6, y: 5.85, w: 0.2, h: 0.56, color: C.gray, fontSize: 18, align: 'center' })
  s.addText('→', { x: 3.0, y: 5.85, w: 0.2, h: 0.56, color: C.gray, fontSize: 18, align: 'center' })
  s.addShape(pptx.ShapeType.roundRect, {
    x: 4.5, y: 5.85, w: 1.2, h: 0.62, fill: { color: 'FEE2E2' }, line: { color: 'FECACA', width: 0.75 }, rectRadius: 0.08,
  })
  s.addText('⚠️\nQuá hạn\n(tự động)', { x: 4.5, y: 5.85, w: 1.2, h: 0.62, color: C.red, fontSize: 8.5, bold: true, align: 'center', valign: 'middle' })
  s.addShape(pptx.ShapeType.line, { x: 1.0, y: 6.64, w: 3.5, h: 0, line: { color: 'FCA5A5', width: 1, dashType: 'dash' } })

  // Right: mock task table
  addCard(s, { x: 6.1, y: 0.9, w: 6.95, h: 5.75 })
  s.addText('Danh sách nhiệm vụ', { x: 6.25, y: 0.96, w: 6.65, h: 0.3, color: C.navy, fontSize: 12, bold: true })

  // Table header
  s.addShape(pptx.ShapeType.rect, { x: 6.1, y: 1.35, w: 6.95, h: 0.32, fill: { color: C.navy }, line: { none: true } })
  const colHdrs = [
    { t: 'Tên nhiệm vụ', x: 6.18, w: 2.5 },
    { t: 'Đơn vị chủ trì', x: 8.72, w: 1.6 },
    { t: 'Chu kỳ', x: 10.36, w: 0.95 },
    { t: 'Thời hạn', x: 11.35, w: 0.95 },
    { t: 'Trạng thái', x: 12.34, w: 1.63 },
  ]
  colHdrs.forEach(({ t, x, w }) => {
    s.addText(t, { x, y: 1.35, w, h: 0.32, color: C.white, fontSize: 9, bold: true, valign: 'middle' })
  })

  const rows = [
    { title: 'Tuần tra giao thông QL1A', dept: 'P.CS Giao thông', freq: 'Hàng tuần', dl: '09/05/2026', st: 'in_progress' },
    { title: 'Kiểm tra PCCC cơ sở KD', dept: 'P.PCCC', freq: 'Hàng tháng', dl: '14/05/2026', st: 'in_progress' },
    { title: 'Bảo vệ an ninh Lễ hội tỉnh', dept: 'P.CS Cơ động', freq: 'Một lần', dl: '16/05/2026', st: 'pending' },
    { title: 'Điều tra vụ trộm tài sản', dept: 'P.CS Hình sự', freq: 'Một lần', dl: '13/05/2026', st: 'in_progress' },
    { title: 'Báo cáo tệ nạn Q.II', dept: 'P.CS ATXH', freq: 'Hàng quý', dl: '03/05/2026', st: 'overdue', dlRed: true },
    { title: 'Điều tra vụ CGTT Tân Bình', dept: 'P.CS Hình sự', freq: 'Một lần', dl: '01/05/2026', st: 'completed' },
  ]
  rows.forEach(({ title, dept, freq, dl, st, dlRed }, ri) => {
    const ry = 1.67 + ri * 0.7
    if (ri % 2 === 1) {
      s.addShape(pptx.ShapeType.rect, { x: 6.1, y: ry, w: 6.95, h: 0.7, fill: { color: 'F8FAFC' }, line: { none: true } })
    }
    s.addText(title, { x: 6.18, y: ry + 0.19, w: 2.45, h: 0.32, color: C.navy, fontSize: 9.5, bold: true })
    s.addText(dept,  { x: 8.72, y: ry + 0.19, w: 1.55, h: 0.32, color: C.gray, fontSize: 8.5 })
    s.addText(freq,  { x: 10.36, y: ry + 0.19, w: 0.9,  h: 0.32, color: C.gray, fontSize: 8.5 })
    s.addText(dl,    { x: 11.35, y: ry + 0.19, w: 0.9,  h: 0.32, color: dlRed ? C.red : C.gray, fontSize: 8.5, bold: !!dlRed })
    statusBadge(s, { pending: 'Chưa TH', in_progress: 'Đang TH', completed: 'Hoàn thành', overdue: 'Quá hạn' }[st], 12.32, ry + 0.22, st)
  })
})()

// ═══════════════════════════════════════════════════════════
// SLIDE 7 – CHI TIẾT NHIỆM VỤ
// ═══════════════════════════════════════════════════════════
;(() => {
  const s = pptx.addSlide()
  addHeader(s, '🔍', 'Chi tiết Nhiệm vụ – Báo cáo & Giải trình')

  // Task info card
  addCard(s, { x: 0.25, y: 0.9, w: 6.3, h: 2.55 })
  s.addText('NHIỆM VỤ', { x: 0.42, y: 0.97, w: 5.9, h: 0.2, color: C.gray, fontSize: 8, bold: true, charSpacing: 1.5 })
  s.addText('Điều tra vụ trộm cắp tài sản tại phường Hòa Phú', {
    x: 0.42, y: 1.18, w: 4.5, h: 0.55, color: C.navy, fontSize: 13, bold: true, lineSpacingMultiple: 1.2,
  })
  statusBadge(s, 'Đang TH', 5.1, 1.22, 'in_progress')

  const info = [
    ['🏢 Chủ trì:', 'P.CS Hình sự'],
    ['🤝 Phối hợp:', 'P.CS ATXH'],
    ['📅 Chu kỳ:', 'Một lần'],
    ['⏰ Hạn:', '13/05/2026'],
  ]
  info.forEach(([lbl, val], i) => {
    s.addText(lbl, { x: 0.42 + (i % 2) * 3.0, y: 1.82 + Math.floor(i / 2) * 0.3, w: 1.3, h: 0.28, color: C.gray, fontSize: 9 })
    s.addText(val, { x: 1.75 + (i % 2) * 3.0, y: 1.82 + Math.floor(i / 2) * 0.3, w: 1.5, h: 0.28, color: C.navy, fontSize: 9, bold: true })
  })
  // Progress bar
  s.addText('Tiến độ hoàn thành:', { x: 0.42, y: 2.48, w: 2.3, h: 0.24, color: C.gray, fontSize: 9 })
  s.addText('40%', { x: 5.8, y: 2.48, w: 0.6, h: 0.24, color: C.indigo, fontSize: 9, bold: true })
  s.addShape(pptx.ShapeType.rect, { x: 0.42, y: 2.75, w: 5.9, h: 0.1, fill: { color: 'E5E7EB' }, line: { none: true } })
  s.addShape(pptx.ShapeType.rect, { x: 0.42, y: 2.75, w: 2.36, h: 0.1, fill: { color: '3B82F6' }, line: { none: true } })

  // Result card
  addCard(s, { x: 0.25, y: 3.6, w: 6.3, h: 2.05 })
  sectionLabel(s, 'Báo cáo kết quả thực hiện (Cán bộ gửi)', 0.42, 3.66)
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.38, y: 3.93, w: 6.02, h: 1.15,
    fill: { color: 'F8FAFC' }, line: { color: C.border, width: 0.75 }, rectRadius: 0.07,
  })
  s.addText('P.CS Hình sự', { x: 0.52, y: 3.98, w: 3.0, h: 0.24, color: C.navy, fontSize: 10, bold: true })
  s.addText('06/05/2026  15:30', { x: 4.7, y: 3.98, w: 1.6, h: 0.24, color: C.gray, fontSize: 8.5 })
  s.addText('Đã phỏng vấn 5 nhân chứng, thu thập 3 đoạn video camera an ninh, xác định được 2 nghi phạm.', {
    x: 0.52, y: 4.24, w: 5.74, h: 0.5, color: C.gray, fontSize: 9.5, lineSpacingMultiple: 1.3,
  })
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.52, y: 4.76, w: 1.1, h: 0.22, fill: { color: 'EFF6FF' }, line: { color: 'BFDBFE', width: 0.5 }, rectRadius: 0.08,
  })
  s.addText('40% hoàn thành', { x: 0.52, y: 4.76, w: 1.1, h: 0.22, color: C.indigo, fontSize: 7.5, bold: true, align: 'center', valign: 'middle' })
  s.addText('📎  Đính kèm: PDF, Word, Excel, ảnh (tối đa 10MB/file)', {
    x: 0.38, y: 5.18, w: 6.0, h: 0.3, color: C.gray, fontSize: 9, italic: true,
  })

  // Right: explanation
  s.addShape(pptx.ShapeType.roundRect, {
    x: 6.8, y: 0.9, w: 6.25, h: 2.0,
    fill: { color: 'FFF5F5' }, line: { color: 'FECACA', width: 1 }, rectRadius: 0.1,
  })
  s.addText('⚠️  Giải trình chậm muộn', { x: 7.0, y: 0.98, w: 4.0, h: 0.34, color: C.red, fontSize: 12, bold: true })
  s.addShape(pptx.ShapeType.roundRect, {
    x: 7.0, y: 1.0, w: 1.7, h: 0.26, fill: { color: 'FEE2E2' }, line: { none: true }, rectRadius: 0.1,
  })
  s.addText('Quá hạn 3 ngày', { x: 11.2, y: 1.0, w: 1.7, h: 0.26, color: C.red, fontSize: 8.5, bold: true, align: 'center', valign: 'middle' })
  s.addShape(pptx.ShapeType.roundRect, {
    x: 7.0, y: 1.44, w: 5.9, h: 1.3,
    fill: { color: 'FEF2F2' }, line: { color: 'FECACA', width: 0.75 }, rectRadius: 0.07,
  })
  s.addText('Khi nhiệm vụ quá hạn → đơn vị phải nộp bản giải trình trình bày lý do và biện pháp khắc phục, có thể đính kèm tài liệu minh chứng.', {
    x: 7.12, y: 1.52, w: 5.66, h: 1.1, color: '7F1D1D', fontSize: 9.5, lineSpacingMultiple: 1.4, valign: 'middle',
  })

  // Admin actions
  addCard(s, { x: 6.8, y: 3.05, w: 6.25, h: 2.0, borderColor: C.yellow })
  sectionLabel(s, 'Quyền Admin trên chi tiết nhiệm vụ', 6.97, 3.11)
  const adminActs = [
    ['✏️', 'Chỉnh sửa nhiệm vụ', 'Cập nhật thông tin, gia hạn deadline'],
    ['📊', 'Xem tất cả báo cáo', 'Xem kết quả từ đơn vị chủ trì & phối hợp'],
    ['📝', 'Xem bản giải trình', 'Kiểm tra lý do chậm muộn của đơn vị'],
  ]
  adminActs.forEach(([icon, t, sub], i) => {
    s.addText(icon, { x: 6.97, y: 3.42 + i * 0.5, w: 0.4, h: 0.42, fontSize: 18, valign: 'middle' })
    s.addText(t,   { x: 7.42, y: 3.42 + i * 0.5, w: 5.0, h: 0.22, color: C.navy, fontSize: 10, bold: true })
    s.addText(sub, { x: 7.42, y: 3.64 + i * 0.5, w: 5.0, h: 0.22, color: C.gray, fontSize: 9 })
  })

  // Upload box
  s.addShape(pptx.ShapeType.roundRect, {
    x: 6.8, y: 5.22, w: 6.25, h: 1.43,
    fill: { color: C.navy }, line: { none: true }, rectRadius: 0.1,
  })
  s.addText('📎  Upload tài liệu đính kèm', { x: 7.0, y: 5.3, w: 5.85, h: 0.3, color: C.gold, fontSize: 11, bold: true })
  const types = ['📄 PDF', '📝 Word (.docx)', '📊 Excel (.xlsx)', '🖼️ Hình ảnh', '⚖️ Max 10MB']
  types.forEach((t, i) => {
    s.addShape(pptx.ShapeType.roundRect, {
      x: 7.0 + (i % 3) * 1.95, y: 5.68 + Math.floor(i / 3) * 0.36, w: 1.8, h: 0.28,
      fill: { color: 'FFFFFF', transparency: 85 }, line: { color: 'FFFFFF', transparency: 70, width: 0.5 }, rectRadius: 0.08,
    })
    s.addText(t, {
      x: 7.0 + (i % 3) * 1.95, y: 5.68 + Math.floor(i / 3) * 0.36, w: 1.8, h: 0.28,
      color: 'DDDDDD', fontSize: 8.5, align: 'center', valign: 'middle',
    })
  })
})()

// ═══════════════════════════════════════════════════════════
// SLIDE 8 – QUẢN LÝ ĐƠN VỊ
// ═══════════════════════════════════════════════════════════
;(() => {
  const s = pptx.addSlide()
  addHeader(s, '🏢', 'Quản lý Đơn vị (Phòng ban)')

  addCard(s, { x: 0.25, y: 0.9, w: 5.5, h: 3.1, borderColor: C.navy })
  sectionLabel(s, 'Chức năng quản lý (Admin)', 0.42, 0.96)
  const funcs = [
    ['➕', 'Thêm đơn vị mới', 'Mã (CSGT, PCCC...) + tên + mô tả'],
    ['✏️', 'Chỉnh sửa thông tin', 'Cập nhật tên, mô tả đơn vị'],
    ['🔄', 'Kích hoạt / Vô hiệu hóa', 'Toggle trạng thái hoạt động'],
    ['🔍', 'Tìm kiếm', 'Lọc theo mã, tên hoặc mô tả đơn vị'],
  ]
  funcs.forEach(([icon, t, sub], i) => {
    s.addText(icon, { x: 0.38, y: 1.22 + i * 0.68, w: 0.45, h: 0.6, fontSize: 18, valign: 'middle' })
    s.addText(t,   { x: 0.87, y: 1.22 + i * 0.68, w: 4.7, h: 0.26, color: C.navy, fontSize: 10.5, bold: true })
    s.addText(sub, { x: 0.87, y: 1.48 + i * 0.68, w: 4.7, h: 0.26, color: C.gray, fontSize: 9.5 })
  })

  // 16 departments
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.25, y: 4.15, w: 5.5, h: 3.55,
    fill: { color: C.navy }, line: { none: true }, rectRadius: 0.1,
  })
  s.addText('16 phòng ban trong hệ thống', { x: 0.42, y: 4.22, w: 5.15, h: 0.3, color: C.gold, fontSize: 11, bold: true })
  const depts = [
    'P.CS Hình sự (CAO)', 'P.CS ATXH (CATQ)',
    'P.CS Giao thông (CSGT)', 'P.CS Cơ động (CACD)',
    'P.Hồ sơ – Kế toán (HSKT)', 'P.PCCC',
    'P.Quản lý Thị trường (QLTT)', 'P.Bảo vệ Lâm nghiệp (BLNN)',
    'P.CS Nước Hình sự (CNHC)', 'P.TC & ĐT Ma tuý (TCDH)',
    'P.An toàn Kinh tế (ATKT)', 'P.SC Trị an (SCTP)',
    'P.CV & Kiểm soát kho (CVKT)', 'P.Thông tấn TT (TTTH)',
    'P.Đào tạo Ngoại hành (DANH)', '+ Mở rộng thêm...',
  ]
  depts.forEach((d, i) => {
    const col = i % 2, row = Math.floor(i / 2)
    s.addText(`• ${d}`, {
      x: 0.4 + col * 2.7, y: 4.62 + row * 0.35, w: 2.55, h: 0.32,
      color: i === 15 ? '5A6A80' : '99B8D8', fontSize: 8.5,
    })
  })

  // Right mock table
  addCard(s, { x: 6.05, y: 0.9, w: 7.0, h: 6.8 })
  // Search bar mock
  s.addShape(pptx.ShapeType.roundRect, {
    x: 6.15, y: 0.97, w: 5.1, h: 0.34, fill: { color: 'F3F4F6' }, line: { color: C.border, width: 0.75 }, rectRadius: 0.07,
  })
  s.addText('🔍  Tìm theo mã, tên, mô tả...', { x: 6.25, y: 0.97, w: 4.9, h: 0.34, color: C.gray, fontSize: 9, valign: 'middle' })
  s.addShape(pptx.ShapeType.roundRect, {
    x: 11.55, y: 0.97, w: 1.35, h: 0.34, fill: { color: C.navy }, line: { none: true }, rectRadius: 0.07,
  })
  s.addText('+ Thêm đơn vị', { x: 11.55, y: 0.97, w: 1.35, h: 0.34, color: C.white, fontSize: 8.5, bold: true, align: 'center', valign: 'middle' })

  // Table
  s.addShape(pptx.ShapeType.rect, { x: 6.05, y: 1.38, w: 7.0, h: 0.32, fill: { color: C.navy }, line: { none: true } })
  ;[['Mã đơn vị', 6.13, 1.15], ['Tên đơn vị', 7.37, 2.3], ['Trạng thái', 9.75, 1.4], ['Thao tác', 11.23, 1.7]].forEach(([t, x, w]) => {
    s.addText(t, { x, y: 1.38, w, h: 0.32, color: C.white, fontSize: 9, bold: true, valign: 'middle' })
  })

  const deptRows = [
    { code: 'CSGT', name: 'Phòng Cảnh sát Giao thông', active: true },
    { code: 'PCCC', name: 'Phòng Phòng chống & Cứu nạn', active: true },
    { code: 'ATKT', name: 'Phòng An toàn Kinh tế', active: false },
    { code: 'CAO',  name: 'Phòng Cảnh sát Hình sự', active: true },
    { code: 'CATQ', name: 'Phòng CS An toàn xã hội', active: true },
    { code: 'HSKT', name: 'Phòng Hồ sơ – Kế toán', active: true },
    { code: 'CACD', name: 'Phòng Cảnh sát Cơ động', active: true },
    { code: 'QLTT', name: 'Phòng Quản lý Thị trường', active: true },
  ]
  deptRows.forEach(({ code, name, active }, i) => {
    const ry = 1.7 + i * 0.62
    if (i % 2 === 1) {
      s.addShape(pptx.ShapeType.rect, { x: 6.05, y: ry, w: 7.0, h: 0.62, fill: { color: 'F8FAFC' }, line: { none: true } })
    }
    // Code chip
    s.addShape(pptx.ShapeType.roundRect, {
      x: 6.15, y: ry + 0.16, w: 0.95, h: 0.28,
      fill: { color: 'F3F4F6' }, line: { color: C.border, width: 0.5 }, rectRadius: 0.05,
    })
    s.addText(code, { x: 6.15, y: ry + 0.16, w: 0.95, h: 0.28, color: C.navy, fontSize: 8.5, bold: true, align: 'center', valign: 'middle' })
    s.addText(name, { x: 7.37, y: ry + 0.17, w: 2.3, h: 0.28, color: C.navy, fontSize: 9.5, bold: true })
    // Status badge
    s.addShape(pptx.ShapeType.roundRect, {
      x: 9.75, y: ry + 0.18, w: 0.9, h: 0.24,
      fill: { color: active ? 'DCFCE7' : 'F3F4F6' }, line: { none: true }, rectRadius: 0.08,
    })
    s.addText(active ? 'Hoạt động' : 'Vô hiệu', {
      x: 9.75, y: ry + 0.18, w: 0.9, h: 0.24,
      color: active ? C.green : C.gray, fontSize: 7.5, bold: true, align: 'center', valign: 'middle',
    })
    // Action btns
    ;['✏️', '🔄'].forEach((ico, bi) => {
      s.addShape(pptx.ShapeType.roundRect, {
        x: 11.28 + bi * 0.48, y: ry + 0.16, w: 0.38, h: 0.28,
        fill: { color: bi === 0 ? 'EFF6FF' : 'F0FDF4' }, line: { color: C.border, width: 0.5 }, rectRadius: 0.05,
      })
      s.addText(ico, { x: 11.28 + bi * 0.48, y: ry + 0.16, w: 0.38, h: 0.28, fontSize: 12, align: 'center', valign: 'middle' })
    })
  })
})()

// ═══════════════════════════════════════════════════════════
// SLIDE 9 – QUẢN LÝ TÀI KHOẢN
// ═══════════════════════════════════════════════════════════
;(() => {
  const s = pptx.addSlide()
  addHeader(s, '👥', 'Quản lý Tài khoản Người dùng')

  addCard(s, { x: 0.25, y: 0.9, w: 5.5, h: 3.5, borderColor: '7C3AED' })
  sectionLabel(s, 'Chức năng quản trị (Admin)', 0.42, 0.96)
  const acts = [
    ['➕', 'Tạo tài khoản mới', 'Tên đăng nhập, mật khẩu, họ tên, phân quyền, đơn vị'],
    ['✏️', 'Chỉnh sửa thông tin', 'Họ tên, phân quyền, gán vào đơn vị khác'],
    ['🔑', 'Đặt lại mật khẩu', 'Admin đặt lại mật khẩu mới cho tài khoản bất kỳ'],
    ['🔄', 'Kích hoạt / Vô hiệu hóa', 'Khóa hoặc mở khóa tài khoản'],
    ['🔍', 'Tìm kiếm', 'Lọc theo tên, tên đăng nhập, đơn vị'],
  ]
  acts.forEach(([icon, t, sub], i) => {
    s.addText(icon, { x: 0.38, y: 1.22 + i * 0.62, w: 0.45, h: 0.54, fontSize: 16, valign: 'middle' })
    s.addText(t,   { x: 0.87, y: 1.22 + i * 0.62, w: 4.7, h: 0.24, color: C.navy, fontSize: 10.5, bold: true })
    s.addText(sub, { x: 0.87, y: 1.46 + i * 0.62, w: 4.7, h: 0.3,  color: C.gray, fontSize: 9 })
  })

  // Demo accounts
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.25, y: 4.54, w: 5.5, h: 3.15,
    fill: { color: '1E3A5F' }, line: { none: true }, rectRadius: 0.1,
  })
  s.addText('Cấu trúc tài khoản demo', { x: 0.42, y: 4.62, w: 5.15, h: 0.3, color: C.gold, fontSize: 11, bold: true })
  const accounts = [
    { icon: '👑', name: 'admin', role: 'Quản trị hệ thống' },
    { icon: '🎖️', name: 'truong_csgt', role: 'Trưởng P.CS Giao thông' },
    { icon: '🎖️', name: 'truong_cao', role: 'Trưởng P.CS Hình sự' },
    { icon: '👤', name: 'csgt1, csgt2', role: 'Cán bộ P.CS Giao thông' },
    { icon: '👤', name: '... 30+ tài khoản', role: 'Nhiều đơn vị khác' },
  ]
  accounts.forEach(({ icon, name, role }, i) => {
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.38, y: 5.0 + i * 0.47, w: 5.22, h: 0.38,
      fill: { color: 'FFFFFF', transparency: 90 }, line: { none: true }, rectRadius: 0.05,
    })
    s.addText(`${icon}  ${name}`, { x: 0.5, y: 5.02 + i * 0.47, w: 2.5, h: 0.34, color: 'AABBD4', fontSize: 9.5 })
    s.addText(role, { x: 3.3, y: 5.02 + i * 0.47, w: 2.2, h: 0.34, color: C.gold, fontSize: 9, align: 'right' })
  })

  // Right: user table
  addCard(s, { x: 6.05, y: 0.9, w: 7.0, h: 6.8 })
  s.addShape(pptx.ShapeType.roundRect, {
    x: 6.15, y: 0.97, w: 5.1, h: 0.34, fill: { color: 'F3F4F6' }, line: { color: C.border, width: 0.75 }, rectRadius: 0.07,
  })
  s.addText('🔍  Tìm theo tên, tài khoản, đơn vị...', { x: 6.25, y: 0.97, w: 4.9, h: 0.34, color: C.gray, fontSize: 9, valign: 'middle' })
  s.addShape(pptx.ShapeType.roundRect, {
    x: 11.55, y: 0.97, w: 1.35, h: 0.34, fill: { color: C.navy }, line: { none: true }, rectRadius: 0.07,
  })
  s.addText('+ Thêm', { x: 11.55, y: 0.97, w: 1.35, h: 0.34, color: C.white, fontSize: 9, bold: true, align: 'center', valign: 'middle' })

  s.addShape(pptx.ShapeType.rect, { x: 6.05, y: 1.38, w: 7.0, h: 0.32, fill: { color: C.navy }, line: { none: true } })
  ;[['Họ tên', 6.13, 1.5], ['Tên ĐN', 7.67, 1.0], ['Phân quyền', 8.71, 1.35], ['Đơn vị', 10.1, 1.2], ['TT', 11.34, 0.62], ['Thao tác', 12.0, 0.95]].forEach(([t, x, w]) => {
    s.addText(t, { x, y: 1.38, w, h: 0.32, color: C.white, fontSize: 8.5, bold: true, valign: 'middle' })
  })

  const users = [
    { name: 'Quản trị viên', uname: 'admin', role: 'QT hệ thống', dept: 'P.Hồ sơ-KT', active: true, roleColor: '92400E', roleFill: 'FEF3C7' },
    { name: 'Bùi Văn Giang', uname: 'truong_csgt', role: 'P.Trách ĐV', dept: 'P.CS GT', active: true, roleColor: C.indigo, roleFill: 'EFF6FF' },
    { name: 'Hoàng Thị Hoa', uname: 'csgt1', role: 'Cán bộ ĐV', dept: 'P.CS GT', active: true, roleColor: C.gray, roleFill: 'F3F4F6' },
    { name: 'Phan Văn Hùng', uname: 'csgt2', role: 'Cán bộ ĐV', dept: 'P.CS GT', active: true, roleColor: C.gray, roleFill: 'F3F4F6' },
    { name: 'Nguyễn Thị Mai', uname: 'truong_cao', role: 'P.Trách ĐV', dept: 'P.CS HS', active: true, roleColor: C.indigo, roleFill: 'EFF6FF' },
    { name: 'Trần Văn Nam', uname: 'cao1', role: 'Cán bộ ĐV', dept: 'P.CS HS', active: false, roleColor: C.gray, roleFill: 'F3F4F6' },
    { name: 'Lê Thị Phương', uname: 'pccc1', role: 'Cán bộ ĐV', dept: 'P.PCCC', active: true, roleColor: C.gray, roleFill: 'F3F4F6' },
    { name: 'Đinh Văn Khoa', uname: 'truong_cacd', role: 'P.Trách ĐV', dept: 'P.CS CĐ', active: true, roleColor: C.indigo, roleFill: 'EFF6FF' },
  ]
  users.forEach(({ name, uname, role, dept, active, roleColor, roleFill }, i) => {
    const ry = 1.72 + i * 0.62
    if (i % 2 === 1) s.addShape(pptx.ShapeType.rect, { x: 6.05, y: ry, w: 7.0, h: 0.62, fill: { color: 'F8FAFC' }, line: { none: true } })
    s.addText(name,  { x: 6.13, y: ry + 0.17, w: 1.5, h: 0.28, color: C.navy, fontSize: 9, bold: true })
    s.addShape(pptx.ShapeType.roundRect, { x: 7.67, y: ry + 0.18, w: 0.96, h: 0.24, fill: { color: 'F3F4F6' }, line: { color: C.border, width: 0.5 }, rectRadius: 0.05 })
    s.addText(uname, { x: 7.67, y: ry + 0.18, w: 0.96, h: 0.24, color: C.navy, fontSize: 7.5, align: 'center', valign: 'middle' })
    s.addShape(pptx.ShapeType.roundRect, { x: 8.71, y: ry + 0.18, w: 1.3, h: 0.24, fill: { color: roleFill }, line: { none: true }, rectRadius: 0.08 })
    s.addText(role, { x: 8.71, y: ry + 0.18, w: 1.3, h: 0.24, color: roleColor, fontSize: 7.5, bold: true, align: 'center', valign: 'middle' })
    s.addText(dept, { x: 10.1, y: ry + 0.17, w: 1.2, h: 0.28, color: C.gray, fontSize: 8.5 })
    s.addShape(pptx.ShapeType.roundRect, { x: 11.34, y: ry + 0.18, w: 0.56, h: 0.24, fill: { color: active ? 'DCFCE7' : 'F3F4F6' }, line: { none: true }, rectRadius: 0.08 })
    s.addText(active ? '✓' : '✗', { x: 11.34, y: ry + 0.18, w: 0.56, h: 0.24, color: active ? C.green : C.gray, fontSize: 9, bold: true, align: 'center', valign: 'middle' })
    ;['✏️', '🔑', '🔄'].forEach((ico, bi) => {
      s.addShape(pptx.ShapeType.roundRect, { x: 12.05 + bi * 0.3, y: ry + 0.17, w: 0.26, h: 0.28, fill: { color: 'F3F4F6' }, line: { color: C.border, width: 0.5 }, rectRadius: 0.04 })
      s.addText(ico, { x: 12.05 + bi * 0.3, y: ry + 0.17, w: 0.26, h: 0.28, fontSize: 9, align: 'center', valign: 'middle' })
    })
  })
})()

// ═══════════════════════════════════════════════════════════
// SLIDE 10 – BÁO CÁO THỐNG KÊ
// ═══════════════════════════════════════════════════════════
;(() => {
  const s = pptx.addSlide()
  addHeader(s, '📊', 'Báo cáo & Thống kê', 'Admin only')

  addCard(s, { x: 0.25, y: 0.9, w: 5.5, h: 3.6, borderColor: C.green })
  sectionLabel(s, 'Nội dung báo cáo', 0.42, 0.96)
  const reports = [
    ['📈', 'Thống kê theo trạng thái', 'Tổng cộng / Chưa TH / Đang TH / Hoàn thành / Quá hạn'],
    ['🏢', 'Thống kê theo đơn vị', 'Số lượng nhiệm vụ từng trạng thái của mỗi phòng ban'],
    ['⚠️', 'Danh sách nhiệm vụ quá hạn', 'Đơn vị, thời hạn, trạng thái cụ thể'],
    ['📅', 'Lọc theo khoảng thời gian', 'Từ ngày – đến ngày tuỳ chọn'],
  ]
  reports.forEach(([icon, t, sub], i) => {
    s.addText(icon, { x: 0.38, y: 1.22 + i * 0.76, w: 0.45, h: 0.65, fontSize: 18, valign: 'middle' })
    s.addText(t,   { x: 0.87, y: 1.22 + i * 0.76, w: 4.7, h: 0.27, color: C.navy, fontSize: 10.5, bold: true })
    s.addText(sub, { x: 0.87, y: 1.49 + i * 0.76, w: 4.7, h: 0.38, color: C.gray, fontSize: 9.5, lineSpacingMultiple: 1.2 })
  })

  // Excel export button
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.25, y: 4.62, w: 5.5, h: 1.2,
    fill: { color: C.green }, line: { none: true }, rectRadius: 0.1,
  })
  s.addText('📥', { x: 0.4, y: 4.72, w: 0.8, h: 1.0, fontSize: 36, align: 'center', valign: 'middle' })
  s.addText('Xuất Excel 1 click', { x: 1.25, y: 4.75, w: 4.35, h: 0.35, color: C.white, fontSize: 14, bold: true })
  s.addText('File .xlsx gồm 3 sheet: Tổng hợp  ·  Theo đơn vị  ·  Quá hạn', {
    x: 1.25, y: 5.12, w: 4.35, h: 0.28, color: 'AEEEC0', fontSize: 9.5,
  })
  s.addText('BaoCaoNhiemVu_20260506_1430.xlsx', {
    x: 1.25, y: 5.42, w: 4.35, h: 0.24, color: 'AEEEC0', fontSize: 8.5, italic: true,
  })

  // Time filter
  addCard(s, { x: 0.25, y: 5.97, w: 5.5, h: 1.72 })
  s.addText('📅  Lọc thời gian:', { x: 0.42, y: 6.04, w: 2.0, h: 0.3, color: C.gray, fontSize: 9.5 })
  ;['Từ ngày', 'Đến ngày'].forEach((lbl, i) => {
    s.addShape(pptx.ShapeType.roundRect, { x: 0.38 + i * 2.7, y: 6.35, w: 2.5, h: 0.34, fill: { color: 'F3F4F6' }, line: { color: C.border, width: 0.75 }, rectRadius: 0.06 })
    s.addText(lbl, { x: 0.38 + i * 2.7, y: 6.35, w: 2.5, h: 0.34, color: C.gray, fontSize: 9, align: 'center', valign: 'middle' })
  })
  s.addShape(pptx.ShapeType.roundRect, { x: 0.38, y: 6.88, w: 1.12, h: 0.34, fill: { color: C.navy }, line: { none: true }, rectRadius: 0.06 })
  s.addText('Áp dụng', { x: 0.38, y: 6.88, w: 1.12, h: 0.34, color: C.white, fontSize: 9, bold: true, align: 'center', valign: 'middle' })
  s.addShape(pptx.ShapeType.roundRect, { x: 1.58, y: 6.88, w: 1.12, h: 0.34, fill: { color: 'F3F4F6' }, line: { color: C.border, width: 0.75 }, rectRadius: 0.06 })
  s.addText('Đặt lại', { x: 1.58, y: 6.88, w: 1.12, h: 0.34, color: C.gray, fontSize: 9, align: 'center', valign: 'middle' })

  // Right: stat cards + table
  const statCards = [
    { n: '21', lbl: 'Tổng cộng', fill: 'EFF6FF', color: C.indigo },
    { n: '8',  lbl: 'Chưa TH',   fill: 'F9FAFB', color: C.gray },
    { n: '7',  lbl: 'Đang TH',   fill: 'FEF9C3', color: C.yellow },
    { n: '3',  lbl: 'Hoàn thành',fill: 'F0FDF4', color: C.green },
    { n: '3',  lbl: 'Quá hạn',   fill: 'FEF2F2', color: C.red },
  ]
  statCards.forEach(({ n, lbl, fill, color }, i) => {
    const sx = 6.05 + i * 1.47
    s.addShape(pptx.ShapeType.roundRect, {
      x: sx, y: 0.9, w: 1.35, h: 1.2,
      fill: { color: fill }, line: { color: C.border, width: 0.75 }, rectRadius: 0.08,
    })
    s.addText(n,   { x: sx, y: 0.98, w: 1.35, h: 0.55, color, fontSize: 30, bold: true, align: 'center' })
    s.addText(lbl, { x: sx, y: 1.53, w: 1.35, h: 0.5,  color: C.gray, fontSize: 8.5, align: 'center', lineSpacingMultiple: 1.2 })
  })

  // By-department table
  addCard(s, { x: 6.05, y: 2.25, w: 7.0, h: 5.44 })
  s.addText('Thống kê theo đơn vị', { x: 6.2, y: 2.32, w: 6.7, h: 0.3, color: C.navy, fontSize: 11, bold: true })

  s.addShape(pptx.ShapeType.rect, { x: 6.05, y: 2.7, w: 7.0, h: 0.3, fill: { color: C.navy }, line: { none: true } })
  ;[['Đơn vị', 6.13, 3.5], ['Trạng thái', 9.7, 1.5], ['Số lượng', 11.3, 1.65]].forEach(([t, x, w]) => {
    s.addText(t, { x, y: 2.7, w, h: 0.3, color: C.white, fontSize: 9, bold: true, valign: 'middle' })
  })

  const byDept = [
    { dept: 'Phòng CS Giao thông', st: 'in_progress', n: '2' },
    { dept: 'Phòng CS Hình sự', st: 'in_progress', n: '2' },
    { dept: 'Phòng CS ATXH', st: 'overdue', n: '1' },
    { dept: 'Phòng PCCC', st: 'in_progress', n: '1' },
    { dept: 'Phòng Hồ sơ – Kế toán', st: 'pending', n: '1' },
    { dept: 'Phòng CS Cơ động', st: 'pending', n: '1' },
    { dept: 'Phòng CS Nước HS', st: 'pending', n: '1' },
    { dept: 'Phòng Bảo vệ Lâm nghiệp', st: 'in_progress', n: '1' },
    { dept: 'Phòng Quản lý Thị trường', st: 'pending', n: '1' },
    { dept: 'Phòng An toàn Kinh tế', st: 'pending', n: '1' },
    { dept: 'Phòng TC & ĐT Ma tuý', st: 'in_progress', n: '1' },
    { dept: 'Phòng SC Trị an', st: 'pending', n: '1' },
  ]
  byDept.forEach(({ dept, st, n }, i) => {
    const ry = 3.0 + i * 0.36
    if (i % 2 === 1) s.addShape(pptx.ShapeType.rect, { x: 6.05, y: ry, w: 7.0, h: 0.36, fill: { color: 'F8FAFC' }, line: { none: true } })
    s.addText(dept, { x: 6.13, y: ry + 0.04, w: 3.5, h: 0.28, color: C.navy, fontSize: 9, bold: true })
    statusBadge(s, { pending: 'Chưa TH', in_progress: 'Đang TH', completed: 'Hoàn thành', overdue: 'Quá hạn' }[st], 9.72, ry + 0.06, st)
    s.addText(n, { x: 11.3, y: ry + 0.04, w: 1.6, h: 0.28, color: st === 'overdue' ? C.red : C.indigo, fontSize: 13, bold: true, align: 'right' })
  })
})()

// ═══════════════════════════════════════════════════════════
// SLIDE 11 – THÔNG BÁO
// ═══════════════════════════════════════════════════════════
;(() => {
  const s = pptx.addSlide()
  addHeader(s, '🔔', 'Hệ thống Thông báo')

  addCard(s, { x: 0.25, y: 0.9, w: 5.5, h: 4.65, borderColor: C.yellow })
  sectionLabel(s, 'Các loại thông báo', 0.42, 0.96)

  const notifTypes = [
    { icon: '📌', title: 'Nhiệm vụ mới được giao', sub: 'Thông báo khi Admin giao nhiệm vụ cho đơn vị', fill: 'FFFBEB', border: 'FDE68A' },
    { icon: '⏰', title: 'Nhắc nhở sắp đến hạn', sub: 'Cảnh báo trước N ngày (cấu hình khi tạo nhiệm vụ)', fill: 'EFF6FF', border: 'BFDBFE' },
    { icon: '🚨', title: 'Nhiệm vụ quá hạn', sub: 'Cảnh báo ngay khi deadline qua mà chưa hoàn thành', fill: 'FEF2F2', border: 'FECACA' },
    { icon: '✅', title: 'Kết quả được cập nhật', sub: 'Thông báo khi đơn vị gửi báo cáo thực hiện', fill: 'F0FDF4', border: 'BBF7D0' },
  ]
  notifTypes.forEach(({ icon, title, sub, fill, border }, i) => {
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.38, y: 1.28 + i * 0.88, w: 5.22, h: 0.76,
      fill: { color: fill }, line: { color: border, width: 0.75 }, rectRadius: 0.08,
    })
    s.addText(icon,  { x: 0.48, y: 1.3 + i * 0.88, w: 0.5, h: 0.72, fontSize: 20, valign: 'middle' })
    s.addText(title, { x: 1.02, y: 1.33 + i * 0.88, w: 4.45, h: 0.26, color: C.navy, fontSize: 10.5, bold: true })
    s.addText(sub,   { x: 1.02, y: 1.59 + i * 0.88, w: 4.45, h: 0.38, color: C.gray, fontSize: 9, lineSpacingMultiple: 1.2 })
  })

  addCard(s, { x: 0.25, y: 5.68, w: 5.5, h: 2.02 })
  sectionLabel(s, 'Tính năng thông báo', 0.42, 5.74)
  const feats = ['🔢  Badge đếm số thông báo chưa đọc trên menu', '👁️  Đánh dấu đã đọc từng thông báo', '✔️  Đánh dấu tất cả là đã đọc', '🎯  Thông báo theo đơn vị / cá nhân']
  feats.forEach((f, i) => {
    s.addText(f, { x: 0.42, y: 6.0 + i * 0.39, w: 5.15, h: 0.34, color: C.gray, fontSize: 9.5 })
  })

  // Notification panel mock
  addCard(s, { x: 6.05, y: 0.9, w: 7.0, h: 6.8 })
  // Header
  s.addShape(pptx.ShapeType.rect, { x: 6.05, y: 0.9, w: 7.0, h: 0.42, fill: { color: 'F8FAFC' }, line: { color: C.border, width: 0.75 } })
  s.addText('🔔  Thông báo', { x: 6.2, y: 0.9, w: 5.0, h: 0.42, color: C.navy, fontSize: 12, bold: true, valign: 'middle' })
  s.addShape(pptx.ShapeType.roundRect, { x: 8.72, y: 1.0, w: 0.38, h: 0.22, fill: { color: C.red }, line: { none: true }, rectRadius: 0.08 })
  s.addText('3', { x: 8.72, y: 1.0, w: 0.38, h: 0.22, color: C.white, fontSize: 9, bold: true, align: 'center', valign: 'middle' })
  s.addText('Đọc tất cả', { x: 11.6, y: 0.9, w: 1.35, h: 0.42, color: C.indigo, fontSize: 9, align: 'right', valign: 'middle' })

  const notifs = [
    { icon: '⏰', title: 'Nhiệm vụ sắp đến hạn', body: '"Báo cáo tài chính quyết toán Q.I" — còn 2 ngày', time: '2 phút trước', fill: 'FFFBEB', unread: true, dotColor: C.yellow },
    { icon: '🚨', title: 'Nhiệm vụ quá hạn!', body: '"Báo cáo tổng hợp tệ nạn Q.II" — đã quá hạn 3 ngày', time: '1 giờ trước', fill: 'FEF2F2', unread: true, dotColor: C.red },
    { icon: '📌', title: 'Nhiệm vụ mới được giao', body: '"Điều tra đường dây ma tuý liên tỉnh" — P.TC&ĐT Ma tuý', time: '3 giờ trước', fill: 'FFFBEB', unread: true, dotColor: C.yellow },
    { icon: '✅', title: 'Kết quả đã được cập nhật', body: '"Kiểm tra kho vũ khí" — P.CV&Kiểm soát kho: 100%', time: 'Hôm qua', fill: C.white, unread: false, dotColor: null },
    { icon: '✅', title: 'Điều tra hoàn thành', body: '"Vụ CGTT xã Tân Bình" — hồ sơ đã chuyển VKS', time: '2 ngày trước', fill: C.white, unread: false, dotColor: null },
  ]
  notifs.forEach(({ icon, title, body, time, fill, unread, dotColor }, i) => {
    const ny = 1.38 + i * 1.1
    if (fill !== C.white) {
      s.addShape(pptx.ShapeType.rect, { x: 6.05, y: ny, w: 7.0, h: 1.1, fill: { color: fill }, line: { none: true } })
    }
    s.addShape(pptx.ShapeType.line, { x: 6.05, y: ny + 1.1, w: 7.0, h: 0, line: { color: C.border, width: 0.5 } })
    s.addText(icon, { x: 6.18, y: ny + 0.2, w: 0.5, h: 0.7, fontSize: 22, align: 'center', valign: 'middle' })
    s.addText(title, { x: 6.75, y: ny + 0.17, w: 5.1, h: 0.28, color: unread ? C.navy : C.gray, fontSize: 10, bold: unread })
    s.addText(body,  { x: 6.75, y: ny + 0.46, w: 5.1, h: 0.36, color: C.gray, fontSize: 8.5, lineSpacingMultiple: 1.2 })
    s.addText(time,  { x: 6.75, y: ny + 0.82, w: 5.1, h: 0.22, color: 'A0AEC0', fontSize: 8 })
    if (dotColor) {
      s.addShape(pptx.ShapeType.ellipse, { x: 12.77, y: ny + 0.42, w: 0.12, h: 0.12, fill: { color: dotColor }, line: { none: true } })
    }
  })
})()

// ═══════════════════════════════════════════════════════════
// SLIDE 12 – TỔNG KẾT
// ═══════════════════════════════════════════════════════════
;(() => {
  const s = pptx.addSlide()
  s.background = { color: C.navy }

  // Gold strips
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: W, h: 0.06, fill: { color: C.accent }, line: { none: true } })
  s.addShape(pptx.ShapeType.rect, { x: 0, y: H - 0.06, w: W, h: 0.06, fill: { color: C.accent }, line: { none: true } })

  s.addText('🛡️', { x: 0, y: 0.35, w: W, h: 0.8, fontSize: 52, align: 'center' })
  s.addText('Tổng kết Hệ thống CAHY', {
    x: 0, y: 1.18, w: W, h: 0.6, color: C.gold, fontSize: 34, bold: true, align: 'center',
  })
  s.addText('Giải pháp quản lý nhiệm vụ nội bộ cho Công an tỉnh — đơn giản, bảo mật, hiệu quả', {
    x: 1, y: 1.82, w: W - 2, h: 0.35, color: '7A91B0', fontSize: 13, align: 'center',
  })

  // Summary numbers
  const nums = [
    { n: '6',    lbl: 'Module chức năng' },
    { n: '16',   lbl: 'Phòng ban quản lý' },
    { n: '3',    lbl: 'Cấp phân quyền' },
    { n: '100%', lbl: 'Nội bộ LAN' },
    { n: 'xlsx', lbl: 'Xuất báo cáo Excel' },
    { n: '∞',    lbl: 'File đính kèm' },
  ]
  nums.forEach(({ n, lbl }, i) => {
    const col = i % 3, row = Math.floor(i / 3)
    const nx = 1.8 + col * 3.4, ny = 2.35 + row * 1.32
    s.addShape(pptx.ShapeType.roundRect, {
      x: nx, y: ny, w: 3.0, h: 1.15,
      fill: { color: 'FFFFFF', transparency: 92 },
      line: { color: 'FFFFFF', transparency: 85, width: 1 },
      rectRadius: 0.1,
    })
    s.addText(n,   { x: nx, y: ny + 0.08, w: 3.0, h: 0.6,  color: C.gold, fontSize: 32, bold: true, align: 'center' })
    s.addText(lbl, { x: nx, y: ny + 0.7,  w: 3.0, h: 0.38, color: '7A91B0', fontSize: 10, align: 'center' })
  })

  // Feature pills
  const features = [
    '✅ Đăng nhập phân quyền', '✅ Giao & theo dõi nhiệm vụ', '✅ Báo cáo tiến độ',
    '✅ Giải trình quá hạn', '✅ Thống kê & Xuất Excel', '✅ Thông báo tự động',
    '✅ Đính kèm tài liệu', '✅ Lọc dữ liệu theo phòng ban',
  ]
  const pillW = 2.9, pillH = 0.3, pillsPerRow = 4
  features.forEach((f, i) => {
    const col = i % pillsPerRow, row = Math.floor(i / pillsPerRow)
    const px = 0.62 + col * (pillW + 0.3), py = 5.0 + row * 0.42
    s.addShape(pptx.ShapeType.roundRect, {
      x: px, y: py, w: pillW, h: pillH,
      fill: { color: 'C8A43A', transparency: 85 },
      line: { color: C.accent, transparency: 70, width: 1 },
      rectRadius: 0.12,
    })
    s.addText(f, { x: px, y: py, w: pillW, h: pillH, color: C.gold, fontSize: 9.5, align: 'center', valign: 'middle' })
  })

  s.addText('Ekila  ·  2026  ·  Hệ thống vận hành trên mạng LAN nội bộ Công an tỉnh', {
    x: 0, y: H - 0.46, w: W, h: 0.32, color: '3D567A', fontSize: 9, align: 'center',
  })
})()

// ── Save ──────────────────────────────────────────────────
pptx.writeFile({ fileName: 'CAHY_Demo_Slides.pptx' })
  .then(() => console.log('✅  CAHY_Demo_Slides.pptx đã được tạo thành công!'))
  .catch(err => { console.error('❌  Lỗi:', err); process.exit(1) })
