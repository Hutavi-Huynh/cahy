import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './users/entities/user.entity';
import { Department } from './departments/entities/department.entity';
import { Task } from './tasks/entities/task.entity';
import { TaskResult } from './tasks/entities/task-result.entity';
import { TaskHistory } from './tasks/entities/task-history.entity';
import { TaskResultHistory } from './tasks/entities/task-result-history.entity';
import { Notification } from './notifications/entities/notification.entity';
import { LoginLog } from './auth/entities/login-log.entity';
import { Role } from './common/enums/role.enum';
import { TaskStatus } from './common/enums/task-status.enum';
import { TaskFrequency } from './common/enums/task-frequency.enum';

dotenv.config();

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'cahy_db',
    entities: [User, Department, Task, TaskResult, TaskHistory, TaskResultHistory, Notification, LoginLog],
    synchronize: true,
  });

  await dataSource.initialize();

  const userRepository = dataSource.getRepository(User);
  const deptRepository = dataSource.getRepository(Department);
  const taskRepository = dataSource.getRepository(Task);
  const taskResultRepository = dataSource.getRepository(TaskResult);
  const taskHistoryRepository = dataSource.getRepository(TaskHistory);
  const taskResultHistoryRepository = dataSource.getRepository(TaskResultHistory);
  const notificationRepository = dataSource.getRepository(Notification);
  const loginLogRepository = dataSource.getRepository(LoginLog);

  console.log('🌱 Starting seed data...\n');

  // Clear all data (đúng thứ tự FK)
  console.log('🗑️  Clearing all data...');
  await dataSource.query('DELETE FROM notifications');
  await dataSource.query('DELETE FROM login_logs');
  await dataSource.query('DELETE FROM task_result_histories');
  await dataSource.query('DELETE FROM task_histories');
  await dataSource.query('DELETE FROM task_results');
  await dataSource.query('DELETE FROM task_cooperating_departments');
  await dataSource.query('DELETE FROM tasks');
  await dataSource.query('DELETE FROM users');
  await dataSource.query('DELETE FROM departments');
  console.log('  ✓ Cleared\n');

  // ───────────────────────────────────────────
  // DEPARTMENTS — theo cơ cấu Công an cấp tỉnh
  // ───────────────────────────────────────────
  console.log('📁 Creating departments...');
  const deptData = [
    // Khối Xây dựng lực lượng
    { code: 'PV01', name: 'Phòng Tham mưu', description: 'Tham mưu, tổng hợp, điều phối chung công tác Công an tỉnh' },
    { code: 'PV06', name: 'Phòng Hồ sơ nghiệp vụ', description: 'Quản lý hồ sơ nghiệp vụ, lưu trữ tài liệu bí mật' },
    { code: 'PX01', name: 'Phòng Tổ chức - Cán bộ', description: 'Quản lý tổ chức bộ máy, nhân sự, công tác cán bộ' },
    { code: 'PX03', name: 'Phòng Công tác chính trị', description: 'Công tác Đảng, giáo dục chính trị tư tưởng, văn hoá' },
    { code: 'PX05', name: 'Thanh tra Công an tỉnh', description: 'Thanh tra, kiểm tra, giải quyết khiếu nại tố cáo' },
    { code: 'PX06', name: 'Uỷ ban Kiểm tra Đảng uỷ', description: 'Kiểm tra kỷ luật Đảng, giám sát đảng viên trong lực lượng' },
    { code: 'PH10', name: 'Phòng Hậu cần', description: 'Quản lý cơ sở vật chất, trang thiết bị, hậu cần kỹ thuật' },
    // Khối An ninh
    { code: 'PA01', name: 'Phòng An ninh đối ngoại', description: 'Bảo vệ an ninh lĩnh vực đối ngoại, quản lý người nước ngoài' },
    { code: 'PA02', name: 'Phòng An ninh nội địa', description: 'Bảo vệ an ninh nội địa, phòng chống tổ chức phản động' },
    { code: 'PA03', name: 'Phòng An ninh chính trị nội bộ', description: 'Bảo vệ an ninh nội bộ cơ quan, tổ chức nhà nước' },
    { code: 'PA04', name: 'Phòng An ninh kinh tế', description: 'Bảo vệ an ninh kinh tế, phòng chống tội phạm kinh tế trọng điểm' },
    { code: 'PA05', name: 'Phòng An ninh mạng và phòng chống tội phạm công nghệ cao', description: 'An ninh mạng, phòng chống tội phạm sử dụng công nghệ cao' },
    { code: 'PA06', name: 'Phòng Kỹ thuật nghiệp vụ và ngoại tuyến', description: 'Kỹ thuật nghiệp vụ trinh sát, hoạt động ngoại tuyến' },
    { code: 'PA08', name: 'Phòng Quản lý xuất nhập cảnh', description: 'Cấp và quản lý hộ chiếu, visa, giấy tờ xuất nhập cảnh' },
    { code: 'PA09', name: 'Phòng An ninh điều tra', description: 'Điều tra các vụ án xâm phạm an ninh quốc gia' },
    // Khối Cảnh sát
    { code: 'PC01', name: 'Văn phòng Cơ quan CSĐT', description: 'Hành chính, văn phòng hỗ trợ cơ quan cảnh sát điều tra' },
    { code: 'PC02', name: 'Phòng Cảnh sát hình sự', description: 'Điều tra tội phạm hình sự: giết người, cướp, trộm, lừa đảo' },
    { code: 'PC03', name: 'Phòng Cảnh sát kinh tế và môi trường', description: 'Điều tra tội phạm kinh tế, tham nhũng, buôn lậu, môi trường' },
    { code: 'PC04', name: 'Phòng Cảnh sát điều tra tội phạm về ma túy', description: 'Phòng chống, điều tra, xử lý tội phạm về ma túy' },
    { code: 'PC06', name: 'Phòng Cảnh sát QLHC về TTXH', description: 'Quản lý hộ khẩu, vũ khí, vật liệu nổ, ngành nghề có điều kiện' },
    { code: 'PC07', name: 'Phòng Cảnh sát PCCC và CNCH', description: 'Phòng cháy chữa cháy, cứu nạn cứu hộ' },
    { code: 'PC08', name: 'Phòng Cảnh sát giao thông', description: 'Tuần tra kiểm soát, đảm bảo trật tự an toàn giao thông đường bộ' },
    { code: 'PC09', name: 'Phòng Kỹ thuật hình sự', description: 'Giám định kỹ thuật, phân tích hiện trường và dấu vết tội phạm' },
    { code: 'PC10', name: 'Phòng Cảnh sát thi hành án hình sự và HTTF', description: 'Thi hành án hình sự, hỗ trợ tư pháp' },
    { code: 'PK02', name: 'Phòng Cảnh sát cơ động', description: 'Xử lý tình huống khẩn cấp, bảo vệ sự kiện chính trị lớn' },
    { code: 'PH01', name: 'Phòng Tài chính', description: 'Quản lý ngân sách, tài chính, kế toán toàn đơn vị' },
    { code: 'PH06', name: 'Bệnh viện Công an tỉnh', description: 'Khám chữa bệnh, chăm sóc sức khoẻ cán bộ chiến sĩ' },
    { code: 'PC11', name: 'Trại tạm giam', description: 'Quản lý tạm giam, tạm giữ đối tượng vi phạm pháp luật' },
  ];

  for (const d of deptData) {
    await deptRepository.save({ ...d, isActive: true });
    console.log(`  ✓ ${d.code} - ${d.name}`);
  }

  const allDepartments = await deptRepository.find();
  const byCode = (code: string) => allDepartments.find((d) => d.code === code);

  // ───────────────────────────────────────────
  // USERS
  // ───────────────────────────────────────────
  console.log('\n👤 Creating users...');
  const hashedPassword = await bcrypt.hash('123456', 10);

  const usersData = [
    { username: 'admin',      fullName: 'Đại tá Nguyễn Văn Hùng',    role: Role.ADMIN,       deptCode: 'PV01' },
    // Khối XDLL
    { username: 'tp_pv01',   fullName: 'Thượng tá Lê Đình Phong',    role: Role.UNIT_LEAD,   deptCode: 'PV01' },
    { username: 'tp_pv06',   fullName: 'Thượng tá Trần Thị Hương',   role: Role.UNIT_LEAD,   deptCode: 'PV06' },
    { username: 'tp_px01',   fullName: 'Thượng tá Phạm Văn Tuấn',    role: Role.UNIT_LEAD,   deptCode: 'PX01' },
    { username: 'tp_px03',   fullName: 'Trung tá Nguyễn Thị Lan',    role: Role.UNIT_LEAD,   deptCode: 'PX03' },
    { username: 'tp_px05',   fullName: 'Thượng tá Vũ Văn Thành',     role: Role.UNIT_LEAD,   deptCode: 'PX05' },
    { username: 'tp_px06',   fullName: 'Trung tá Đặng Thị Nga',      role: Role.UNIT_LEAD,   deptCode: 'PX06' },
    { username: 'tp_ph10',   fullName: 'Thượng tá Hoàng Văn Minh',   role: Role.UNIT_LEAD,   deptCode: 'PH10' },
    // Khối An ninh
    { username: 'tp_pa01',   fullName: 'Thượng tá Bùi Văn Dũng',     role: Role.UNIT_LEAD,   deptCode: 'PA01' },
    { username: 'tp_pa02',   fullName: 'Thượng tá Đinh Thị Hà',      role: Role.UNIT_LEAD,   deptCode: 'PA02' },
    { username: 'tp_pa03',   fullName: 'Thượng tá Phan Văn Tâm',     role: Role.UNIT_LEAD,   deptCode: 'PA03' },
    { username: 'tp_pa04',   fullName: 'Thượng tá Lý Văn Khoa',      role: Role.UNIT_LEAD,   deptCode: 'PA04' },
    { username: 'tp_pa05',   fullName: 'Trung tá Trương Văn Bình',   role: Role.UNIT_LEAD,   deptCode: 'PA05' },
    { username: 'tp_pa06',   fullName: 'Thượng tá Dương Thị Thu',    role: Role.UNIT_LEAD,   deptCode: 'PA06' },
    { username: 'tp_pa08',   fullName: 'Thượng tá Lưu Văn Nam',      role: Role.UNIT_LEAD,   deptCode: 'PA08' },
    { username: 'tp_pa09',   fullName: 'Thượng tá Hồ Văn An',        role: Role.UNIT_LEAD,   deptCode: 'PA09' },
    // Khối Cảnh sát
    { username: 'tp_pc01',   fullName: 'Thượng tá Võ Thị Mai',       role: Role.UNIT_LEAD,   deptCode: 'PC01' },
    { username: 'tp_pc02',   fullName: 'Thượng tá Cao Văn Long',      role: Role.UNIT_LEAD,   deptCode: 'PC02' },
    { username: 'tp_pc03',   fullName: 'Thượng tá Tạ Văn Hiếu',      role: Role.UNIT_LEAD,   deptCode: 'PC03' },
    { username: 'tp_pc04',   fullName: 'Thượng tá Lã Văn Quân',      role: Role.UNIT_LEAD,   deptCode: 'PC04' },
    { username: 'tp_pc06',   fullName: 'Thượng tá Chu Thị Yến',      role: Role.UNIT_LEAD,   deptCode: 'PC06' },
    { username: 'tp_pc07',   fullName: 'Thượng tá Mai Văn Phúc',     role: Role.UNIT_LEAD,   deptCode: 'PC07' },
    { username: 'tp_pc08',   fullName: 'Thượng tá Đào Văn Sơn',      role: Role.UNIT_LEAD,   deptCode: 'PC08' },
    { username: 'tp_pc09',   fullName: 'Thượng tá Kiều Thị Vân',     role: Role.UNIT_LEAD,   deptCode: 'PC09' },
    { username: 'tp_pc10',   fullName: 'Trung tá Bạch Văn Tú',       role: Role.UNIT_LEAD,   deptCode: 'PC10' },
    { username: 'tp_pk02',   fullName: 'Thượng tá Hà Văn Khánh',     role: Role.UNIT_LEAD,   deptCode: 'PK02' },
    { username: 'tp_ph01',   fullName: 'Trung tá Mã Thị Liên',       role: Role.UNIT_LEAD,   deptCode: 'PH01' },
    { username: 'tp_ph06',   fullName: 'Thượng tá Phùng Văn Hiệp',   role: Role.UNIT_LEAD,   deptCode: 'PH06' },
    { username: 'tp_pc11',   fullName: 'Thượng tá Ngô Văn Cường',    role: Role.UNIT_LEAD,   deptCode: 'PC11' },
    // Cán bộ các phòng trọng điểm
    { username: 'cb_pc02_1', fullName: 'Thiếu tá Nguyễn Thị Bích',   role: Role.UNIT_MEMBER, deptCode: 'PC02' },
    { username: 'cb_pc02_2', fullName: 'Đại úy Trần Văn Đức',        role: Role.UNIT_MEMBER, deptCode: 'PC02' },
    { username: 'cb_pc04_1', fullName: 'Thiếu tá Lê Thị Hoa',        role: Role.UNIT_MEMBER, deptCode: 'PC04' },
    { username: 'cb_pc04_2', fullName: 'Đại úy Phan Văn Tài',        role: Role.UNIT_MEMBER, deptCode: 'PC04' },
    { username: 'cb_pc08_1', fullName: 'Thiếu tá Vũ Thị Linh',       role: Role.UNIT_MEMBER, deptCode: 'PC08' },
    { username: 'cb_pc08_2', fullName: 'Đại úy Bùi Văn Thắng',       role: Role.UNIT_MEMBER, deptCode: 'PC08' },
    { username: 'cb_pc07_1', fullName: 'Thiếu tá Đặng Văn Cảnh',     role: Role.UNIT_MEMBER, deptCode: 'PC07' },
    { username: 'cb_pa05_1', fullName: 'Thiếu tá Hoàng Thị Diệp',    role: Role.UNIT_MEMBER, deptCode: 'PA05' },
    { username: 'cb_px01_1', fullName: 'Thiếu tá Đinh Văn Lộc',      role: Role.UNIT_MEMBER, deptCode: 'PX01' },
    { username: 'cb_pc03_1', fullName: 'Thiếu tá Cao Thị Thanh',     role: Role.UNIT_MEMBER, deptCode: 'PC03' },
  ];

  const userMap = new Map<string, User>();
  for (const u of usersData) {
    const user = await userRepository.save({
      username: u.username,
      fullName: u.fullName,
      password: hashedPassword,
      role: u.role,
      departmentId: byCode(u.deptCode)?.id,
      isActive: true,
    });
    userMap.set(u.username, user);
    console.log(`  ✓ ${u.username} — ${u.fullName}`);
  }

  const dept = byCode;
  const adminId = userMap.get('admin')?.id;

  // ───────────────────────────────────────────
  // TASKS
  // ───────────────────────────────────────────
  console.log('\n📋 Creating tasks...');

  interface TaskSeed {
    title: string;
    content: string;
    expectedResult: string;
    leadCode: string;
    cooperatingCodes?: string[];
    status: TaskStatus;
    frequency: TaskFrequency;
    deadlineDays: number;
    reminderBefore?: number;
    linhVuc?: string;
  }

  const tasksData: TaskSeed[] = [
    // 0
    {
      title: 'Điều tra vụ trộm cắp tài sản có tổ chức tại khu công nghiệp',
      content: 'Triển khai điều tra nhóm đối tượng chuyên trộm cắp tài sản tại khu công nghiệp, lấy lời khai nhân chứng, thu thập chứng cứ từ camera an ninh và khám nghiệm hiện trường.',
      expectedResult: 'Xác định, bắt giữ toàn bộ đối tượng; lập hồ sơ đề nghị VKS khởi tố vụ án.',
      leadCode: 'PC02',
      cooperatingCodes: ['PC01', 'PC09'],
      status: TaskStatus.IN_PROGRESS,
      frequency: TaskFrequency.ONCE,
      deadlineDays: 10,
      reminderBefore: 3,
      linhVuc: 'Điều tra hình sự',
    },
    // 1
    {
      title: 'Triệt phá đường dây vận chuyển ma túy liên tỉnh',
      content: 'Trinh sát, xác minh đường dây vận chuyển ma túy từ biên giới vào tỉnh. Phối hợp các lực lượng để bắt giữ đối tượng và thu giữ tang vật.',
      expectedResult: 'Bắt giữ ít nhất 3 đối tượng cầm đầu, thu giữ toàn bộ tang vật, lập hồ sơ khởi tố.',
      leadCode: 'PC04',
      cooperatingCodes: ['PC02'],
      status: TaskStatus.IN_PROGRESS,
      frequency: TaskFrequency.ONCE,
      deadlineDays: 15,
      reminderBefore: 5,
      linhVuc: 'Phòng chống ma túy',
    },
    // 2
    {
      title: 'Tuần tra kiểm soát trật tự an toàn giao thông đường bộ',
      content: 'Tổ chức tuần tra định kỳ trên các tuyến quốc lộ và tỉnh lộ trọng điểm; kiểm tra phương tiện, xử lý vi phạm hành chính về giao thông.',
      expectedResult: 'Mỗi ca xử lý tối thiểu 15 trường hợp vi phạm; không để xảy ra tai nạn giao thông nghiêm trọng.',
      leadCode: 'PC08',
      status: TaskStatus.PENDING,
      frequency: TaskFrequency.WEEKLY,
      deadlineDays: 5,
      reminderBefore: 1,
      linhVuc: 'Trật tự an toàn giao thông',
    },
    // 3
    {
      title: 'Kiểm tra an toàn phòng cháy chữa cháy các cơ sở sản xuất kinh doanh',
      content: 'Kiểm tra định kỳ hệ thống PCCC, lối thoát hiểm, bình chữa cháy tại các cơ sở trên địa bàn. Lập biên bản và xử phạt vi phạm.',
      expectedResult: 'Kiểm tra ít nhất 30 cơ sở; 100% vi phạm được phát hiện xử lý hoặc yêu cầu khắc phục.',
      leadCode: 'PC07',
      cooperatingCodes: ['PK02'],
      status: TaskStatus.IN_PROGRESS,
      frequency: TaskFrequency.MONTHLY,
      deadlineDays: 8,
      reminderBefore: 2,
      linhVuc: 'Phòng cháy chữa cháy',
    },
    // 4
    {
      title: 'Điều tra tội phạm lừa đảo chiếm đoạt tài sản qua mạng',
      content: 'Tiếp nhận và xử lý các vụ lừa đảo trực tuyến; phân tích dữ liệu số, truy vết tài khoản, thu thập bằng chứng điện tử theo quy định pháp luật.',
      expectedResult: 'Giải quyết ít nhất 5 vụ việc; truy vết được đối tượng trong ít nhất 2 vụ án nghiêm trọng.',
      leadCode: 'PA05',
      cooperatingCodes: ['PC03'],
      status: TaskStatus.PENDING,
      frequency: TaskFrequency.ONCE,
      deadlineDays: 20,
      reminderBefore: 5,
      linhVuc: 'An ninh mạng',
    },
    // 5
    {
      title: 'Rà soát người nước ngoài cư trú trái phép trên địa bàn tỉnh',
      content: 'Phối hợp với các phòng ban rà soát, xác minh tình trạng cư trú của người nước ngoài; phát hiện và xử lý trường hợp cư trú quá hạn hoặc không có giấy tờ hợp lệ.',
      expectedResult: 'Rà soát 100% cơ sở lưu trú; lập danh sách và xử lý người nước ngoài vi phạm.',
      leadCode: 'PA08',
      cooperatingCodes: ['PA01'],
      status: TaskStatus.PENDING,
      frequency: TaskFrequency.MONTHLY,
      deadlineDays: 12,
      reminderBefore: 3,
      linhVuc: 'Quản lý xuất nhập cảnh',
    },
    // 6
    {
      title: 'Đánh giá, xếp loại cán bộ chiến sĩ năm 2026',
      content: 'Triển khai công tác đánh giá kết quả công tác, xếp loại hoàn thành nhiệm vụ cho toàn thể cán bộ chiến sĩ năm 2026 theo quy định của Bộ Công an.',
      expectedResult: 'Hoàn thành đánh giá 100% cán bộ đúng thời hạn; tổng hợp báo cáo kết quả gửi Bộ.',
      leadCode: 'PX01',
      cooperatingCodes: ['PX03'],
      status: TaskStatus.PENDING,
      frequency: TaskFrequency.QUARTERLY,
      deadlineDays: 30,
      reminderBefore: 7,
      linhVuc: 'Tổ chức - Cán bộ',
    },
    // 7
    {
      title: 'Xây dựng kế hoạch công tác 6 tháng cuối năm 2026',
      content: 'Tổng hợp kết quả 6 tháng đầu năm, xây dựng kế hoạch công tác chi tiết cho 6 tháng cuối năm của toàn đơn vị, trình lãnh đạo phê duyệt.',
      expectedResult: 'Kế hoạch đầy đủ, sát thực tiễn, được Giám đốc Công an tỉnh phê duyệt trước ngày 15/6.',
      leadCode: 'PV01',
      cooperatingCodes: ['PX01', 'PH01'],
      status: TaskStatus.IN_PROGRESS,
      frequency: TaskFrequency.ONCE,
      deadlineDays: 7,
      reminderBefore: 2,
      linhVuc: 'Tham mưu - Tổng hợp',
    },
    // 8
    {
      title: 'Điều tra vụ gian lận thuế tại doanh nghiệp xuất nhập khẩu',
      content: 'Thu thập chứng cứ, làm việc với cơ quan thuế và hải quan; xác định hành vi gian lận và định lượng thiệt hại ngân sách nhà nước.',
      expectedResult: 'Lập đầy đủ hồ sơ vụ án; đề xuất khởi tố hoặc xử phạt hành chính theo quy định.',
      leadCode: 'PC03',
      cooperatingCodes: ['PA04'],
      status: TaskStatus.PENDING,
      frequency: TaskFrequency.ONCE,
      deadlineDays: 25,
      reminderBefore: 5,
      linhVuc: 'Kinh tế - Tài chính',
    },
    // 9
    {
      title: 'Bảo vệ an ninh Kỳ họp thứ 9 Hội đồng nhân dân tỉnh',
      content: 'Triển khai lực lượng bảo vệ, kiểm soát an ninh trật tự trong suốt thời gian diễn ra kỳ họp HĐND tỉnh; phối hợp phân luồng giao thông khu vực.',
      expectedResult: 'Kỳ họp diễn ra an toàn tuyệt đối, không để xảy ra sự cố mất an ninh trật tự.',
      leadCode: 'PK02',
      cooperatingCodes: ['PC08'],
      status: TaskStatus.PENDING,
      frequency: TaskFrequency.ONCE,
      deadlineDays: 4,
      reminderBefore: 1,
      linhVuc: 'Bảo vệ sự kiện',
    },
    // 10
    {
      title: 'Tổng rà soát, thu hồi vũ khí và vật liệu nổ trong nhân dân',
      content: 'Triển khai chiến dịch vận động, thu hồi vũ khí, vật liệu nổ, công cụ hỗ trợ tự chế trong nhân dân; phối hợp tuyên truyền pháp luật về quản lý vũ khí.',
      expectedResult: 'Thu hồi tối thiểu 50 khẩu vũ khí các loại; 100% xã/phường hoàn thành rà soát.',
      leadCode: 'PC06',
      cooperatingCodes: ['PC02'],
      status: TaskStatus.IN_PROGRESS,
      frequency: TaskFrequency.MONTHLY,
      deadlineDays: 10,
      reminderBefore: 3,
      linhVuc: 'Quản lý hành chính',
    },
    // 11
    {
      title: 'Phòng chống hoạt động tuyên truyền chống phá Nhà nước trên mạng xã hội',
      content: 'Theo dõi, phát hiện và xử lý các hoạt động tuyên truyền, kích động chống phá Nhà nước trên mạng xã hội và các nền tảng trực tuyến.',
      expectedResult: 'Phát hiện và xử lý kịp thời 100% tài khoản/nội dung vi phạm; báo cáo định kỳ lên cấp trên.',
      leadCode: 'PA02',
      cooperatingCodes: ['PA05', 'PA03'],
      status: TaskStatus.PENDING,
      frequency: TaskFrequency.MONTHLY,
      deadlineDays: 18,
      reminderBefore: 4,
      linhVuc: 'An ninh nội địa',
    },
    // 12
    {
      title: 'Kiểm kê trang thiết bị, vũ khí, công cụ hỗ trợ toàn đơn vị',
      content: 'Tổ chức kiểm kê toàn bộ trang bị, phương tiện, vũ khí tại tất cả các phòng ban. Đối chiếu với sổ sách, báo cáo sai lệch.',
      expectedResult: 'Báo cáo kiểm kê đầy đủ, chính xác; xử lý ngay các sai lệch phát hiện được.',
      leadCode: 'PH10',
      status: TaskStatus.COMPLETED,
      frequency: TaskFrequency.QUARTERLY,
      deadlineDays: -5,
      linhVuc: 'Hậu cần - Kỹ thuật',
    },
    // 13
    {
      title: 'Giám định kỹ thuật hình sự vụ cháy nhà kho tại khu công nghiệp',
      content: 'Khám nghiệm hiện trường, lấy mẫu giám định, phân tích nguyên nhân vụ cháy; xác định có yếu tố phóng hỏa hay không.',
      expectedResult: 'Kết luận giám định chính xác, đúng thời hạn, phục vụ điều tra vụ án.',
      leadCode: 'PC09',
      cooperatingCodes: ['PC02'],
      status: TaskStatus.COMPLETED,
      frequency: TaskFrequency.ONCE,
      deadlineDays: -3,
      linhVuc: 'Giám định kỹ thuật hình sự',
    },
    // 14
    {
      title: 'Thanh tra công tác tiếp dân và giải quyết đơn thư khiếu nại tố cáo',
      content: 'Thanh tra việc thực hiện quy trình tiếp dân, giải quyết đơn thư tại các đơn vị; đánh giá kết quả thực hiện so với chỉ tiêu kế hoạch.',
      expectedResult: 'Kết luận thanh tra chi tiết; kiến nghị xử lý các đơn vị không đạt yêu cầu.',
      leadCode: 'PX05',
      status: TaskStatus.PENDING,
      frequency: TaskFrequency.QUARTERLY,
      deadlineDays: 35,
      reminderBefore: 7,
      linhVuc: 'Thanh tra - Kiểm tra',
    },
    // 15
    {
      title: 'Quyết toán ngân sách quý II/2026 và lập dự toán quý III',
      content: 'Tổng hợp chi tiết thu chi ngân sách quý II, lập báo cáo quyết toán gửi cơ quan tài chính. Đồng thời xây dựng dự toán ngân sách quý III trình duyệt.',
      expectedResult: 'Báo cáo quyết toán quý II hoàn chỉnh, được phê duyệt; dự toán quý III được phân bổ đúng hạn.',
      leadCode: 'PH01',
      cooperatingCodes: ['PH10'],
      status: TaskStatus.OVERDUE,
      frequency: TaskFrequency.QUARTERLY,
      deadlineDays: -2,
      reminderBefore: 5,
      linhVuc: 'Tài chính - Kế toán',
    },
    // 16
    {
      title: 'Điều tra vụ tham nhũng trong đấu thầu dự án đầu tư công',
      content: 'Xác minh thông tin tố giác về hành vi thông thầu, nâng khống giá trị hợp đồng trong các dự án đầu tư công; thu thập tài liệu và lời khai các bên liên quan.',
      expectedResult: 'Kết luận điều tra xác thực hoặc bác bỏ tố giác; đề xuất xử lý theo đúng quy định pháp luật.',
      leadCode: 'PA04',
      cooperatingCodes: ['PC03'],
      status: TaskStatus.IN_PROGRESS,
      frequency: TaskFrequency.ONCE,
      deadlineDays: 22,
      reminderBefore: 5,
      linhVuc: 'An ninh kinh tế',
    },
    // 17
    {
      title: 'Rà soát và tổ chức thi hành án phạt tù treo trên địa bàn',
      content: 'Cập nhật danh sách, rà soát tình hình chấp hành điều kiện hưởng án treo; phối hợp địa phương giám sát, quản lý, giáo dục người chấp hành án.',
      expectedResult: 'Danh sách cập nhật đầy đủ; 100% người có án treo được giám sát theo đúng quy định.',
      leadCode: 'PC10',
      cooperatingCodes: ['PC01'],
      status: TaskStatus.PENDING,
      frequency: TaskFrequency.MONTHLY,
      deadlineDays: 14,
      reminderBefore: 3,
      linhVuc: 'Thi hành án',
    },
    // 18
    {
      title: 'Xác minh đối tượng người nước ngoài có nghi vấn hoạt động tình báo',
      content: 'Xác minh nhân thân, hoạt động của các đối tượng người nước ngoài nghi vấn thu thập thông tin nhạy cảm; phối hợp cơ quan hữu quan xử lý theo quy định.',
      expectedResult: 'Kết quả xác minh rõ ràng; nếu xác định vi phạm thì đề xuất biện pháp xử lý phù hợp.',
      leadCode: 'PA01',
      cooperatingCodes: ['PA08'],
      status: TaskStatus.PENDING,
      frequency: TaskFrequency.ONCE,
      deadlineDays: 9,
      reminderBefore: 2,
      linhVuc: 'An ninh đối ngoại',
    },
    // 19
    {
      title: 'Tổ chức Hội nghị Sơ kết công tác 6 tháng đầu năm 2026',
      content: 'Chuẩn bị nội dung, tài liệu, báo cáo phục vụ Hội nghị Sơ kết; tổ chức hội nghị toàn đơn vị, ghi nhận kết quả và phương hướng nhiệm vụ 6 tháng cuối năm.',
      expectedResult: 'Hội nghị tổ chức thành công; nghị quyết được thông qua và triển khai đến toàn thể các đơn vị.',
      leadCode: 'PX03',
      cooperatingCodes: ['PV01', 'PX01'],
      status: TaskStatus.PENDING,
      frequency: TaskFrequency.ONCE,
      deadlineDays: 6,
      reminderBefore: 2,
      linhVuc: 'Công tác chính trị',
    },
  ];

  const taskMap = new Map<number, Task>();
  for (let i = 0; i < tasksData.length; i++) {
    const td = tasksData[i];
    const leadDept = dept(td.leadCode);
    const cooperatingDepts = (td.cooperatingCodes ?? [])
      .map((c) => dept(c))
      .filter(Boolean) as Department[];

    const deadline = new Date(Date.now() + td.deadlineDays * 24 * 60 * 60 * 1000);
    const task = taskRepository.create({
      title: td.title,
      content: td.content,
      expectedResult: td.expectedResult,
      linhVuc: td.linhVuc,
      leadDepartmentId: leadDept?.id,
      cooperatingDepartments: cooperatingDepts,
      status: td.status,
      frequency: td.frequency,
      deadline,
      assignedById: adminId,
      ...(td.reminderBefore !== undefined && { reminderBefore: td.reminderBefore }),
    });
    const saved = await taskRepository.save(task);
    taskMap.set(i, saved);
    const coopNames = cooperatingDepts.map((d) => d.code).join(', ');
    console.log(`  ✓ [${td.leadCode}${coopNames ? ' + ' + coopNames : ''}] ${td.title.substring(0, 55)}...`);
  }

  // ───────────────────────────────────────────
  // TASK RESULTS
  // ───────────────────────────────────────────
  console.log('\n📊 Creating task results...');
  const resultsData = [
    {
      taskIndex: 0, deptCode: 'PC02', username: 'cb_pc02_1', completionRate: 45,
      content: 'Đã thu thập 4 đoạn camera an ninh, xác định 3 nghi phạm. Đang xác minh nhân thân và phân tích dữ liệu để lập lệnh bắt.',
    },
    {
      taskIndex: 0, deptCode: 'PC09', username: 'tp_pc09', completionRate: 80,
      content: 'Hoàn thành khám nghiệm hiện trường, thu thập dấu vân tay và mẫu sinh học. Kết quả giám định đang chờ xử lý phòng thí nghiệm.',
    },
    {
      taskIndex: 1, deptCode: 'PC04', username: 'tp_pc04', completionRate: 60,
      content: 'Đã xác định 5 đối tượng liên quan, đang theo dõi và chờ thời điểm thích hợp để triển khai phá án đồng loạt trên nhiều địa bàn.',
    },
    {
      taskIndex: 1, deptCode: 'PC02', username: 'cb_pc02_2', completionRate: 70,
      content: 'Hỗ trợ xác minh tiền án tiền sự của các đối tượng, cung cấp tài liệu liên quan cho PC04.',
    },
    {
      taskIndex: 3, deptCode: 'PC07', username: 'cb_pc07_1', completionRate: 67,
      content: 'Đã kiểm tra 20/30 cơ sở. Phát hiện 7 cơ sở vi phạm về bình chữa cháy và lối thoát hiểm, đã lập 7 biên bản xử phạt hành chính.',
    },
    {
      taskIndex: 7, deptCode: 'PV01', username: 'tp_pv01', completionRate: 75,
      content: 'Đã tổng hợp báo cáo 6 tháng đầu năm từ tất cả 28 phòng ban. Đang dự thảo kế hoạch 6 tháng cuối năm, dự kiến hoàn thành trong 2 ngày.',
    },
    {
      taskIndex: 10, deptCode: 'PC06', username: 'tp_pc06', completionRate: 64,
      content: 'Đã tổ chức 12 đợt vận động tại các xã/phường. Thu hồi được 32 khẩu súng tự chế, 5 khẩu súng quân dụng và nhiều loại hung khí khác.',
    },
    {
      taskIndex: 10, deptCode: 'PC02', username: 'cb_pc02_1', completionRate: 50,
      content: 'Phối hợp tại 8 địa bàn phức tạp; hỗ trợ vận động 3 đối tượng nghi có vũ khí tự nộp cho cơ quan chức năng.',
    },
    {
      taskIndex: 12, deptCode: 'PH10', username: 'tp_ph10', completionRate: 100,
      content: 'Đã hoàn thành kiểm kê toàn bộ 28 phòng ban. Số liệu khớp sổ sách; phát hiện 2 trang thiết bị hỏng, đề xuất thanh lý. Báo cáo đã nộp lãnh đạo.',
    },
    {
      taskIndex: 13, deptCode: 'PC09', username: 'tp_pc09', completionRate: 100,
      content: 'Kết luận giám định: Nguyên nhân cháy do chập điện, loại trừ yếu tố phóng hỏa. Hồ sơ giám định đã bàn giao PC02.',
    },
    {
      taskIndex: 13, deptCode: 'PC02', username: 'tp_pc02', completionRate: 100,
      content: 'Đã tiếp nhận kết quả giám định từ PC09, cập nhật vào hồ sơ vụ án và báo cáo Thủ trưởng cơ quan điều tra.',
    },
    {
      taskIndex: 16, deptCode: 'PA04', username: 'tp_pa04', completionRate: 40,
      content: 'Đã thu thập 45 tài liệu liên quan; làm việc với 8 người có liên quan. Đang phân tích tài liệu kế toán và hồ sơ đấu thầu để xác định hành vi vi phạm.',
    },
  ];

  for (const r of resultsData) {
    const task = taskMap.get(r.taskIndex);
    const deptObj = dept(r.deptCode);
    const submitter = userMap.get(r.username);
    if (task && deptObj) {
      await taskResultRepository.save({
        taskId: task.id,
        departmentId: deptObj.id,
        content: r.content,
        completionRate: r.completionRate,
        submittedById: submitter?.id,
      });
      console.log(`  ✓ [${r.deptCode}] → ${task.title.substring(0, 45)}...`);
    }
  }

  // ───────────────────────────────────────────
  // TASK HISTORIES
  // ───────────────────────────────────────────
  console.log('\n📝 Creating task histories...');
  const taskHistoriesData = [
    {
      taskIndex: 0,
      changeDescription: 'Bổ sung PC09 vào đơn vị phối hợp để hỗ trợ giám định hiện trường',
      oldValue: { cooperatingDepartments: ['PC01'] },
      newValue: { cooperatingDepartments: ['PC01', 'PC09'] },
    },
    {
      taskIndex: 15,
      changeDescription: 'Gia hạn thời hạn nộp báo cáo từ 30/04/2026 đến 05/05/2026',
      oldValue: { deadline: '2026-04-30' },
      newValue: { deadline: '2026-05-05' },
    },
    {
      taskIndex: 7,
      changeDescription: 'Bổ sung PH01 vào đơn vị phối hợp để cung cấp số liệu ngân sách',
      oldValue: { cooperatingDepartments: ['PX01'] },
      newValue: { cooperatingDepartments: ['PX01', 'PH01'] },
    },
  ];

  for (const h of taskHistoriesData) {
    const task = taskMap.get(h.taskIndex);
    if (task && adminId) {
      await taskHistoryRepository.save({
        taskId: task.id,
        changedById: adminId,
        changeDescription: h.changeDescription,
        oldValue: h.oldValue,
        newValue: h.newValue,
        changedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      });
      console.log(`  ✓ ${task.title.substring(0, 45)}...`);
    }
  }

  // ───────────────────────────────────────────
  // TASK RESULT HISTORIES
  // ───────────────────────────────────────────
  console.log('\n📊 Creating task result histories...');
  const allResults = await taskResultRepository.find({ order: { createdAt: 'DESC' } });
  for (let i = 0; i < Math.min(3, allResults.length); i++) {
    const r = allResults[i];
    await taskResultHistoryRepository.save({
      taskResultId: r.id,
      updatedById: r.submittedById,
      content: 'Cập nhật trước: ' + r.content.substring(0, 60) + '...',
      completionRate: Math.max(0, (r.completionRate ?? 0) - 20),
      attachments: [],
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    });
    console.log(`  ✓ Result history ID: ${r.id}`);
  }

  // ───────────────────────────────────────────
  // LOGIN LOGS
  // ───────────────────────────────────────────
  console.log('\n🔐 Creating login logs...');
  const loginLogsData = [
    { username: 'admin',      isSuccess: true },
    { username: 'tp_pc02',   isSuccess: true },
    { username: 'tp_pc04',   isSuccess: true },
    { username: 'tp_pc08',   isSuccess: false, failureReason: 'Sai mật khẩu' },
    { username: 'cb_pc02_1', isSuccess: true },
    { username: 'tp_ph01',   isSuccess: true },
    { username: 'tp_pa05',   isSuccess: true },
    { username: 'admin',      isSuccess: true },
  ];

  for (let i = 0; i < loginLogsData.length; i++) {
    const ld = loginLogsData[i];
    const user = userMap.get(ld.username);
    if (user) {
      await loginLogRepository.save({
        userId: user.id,
        ipAddress: `192.168.${10 + Math.floor(i / 3)}.${100 + i * 11}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        isSuccess: ld.isSuccess,
        loginAt: new Date(Date.now() - (8 - i) * 60 * 60 * 1000),
        ...(!ld.isSuccess && { failureReason: (ld as any).failureReason }),
      });
      console.log(`  ✓ [${ld.username}] ${ld.isSuccess ? 'Thành công' : 'Thất bại — ' + (ld as any).failureReason}`);
    }
  }

  // ───────────────────────────────────────────
  // NOTIFICATIONS
  // ───────────────────────────────────────────
  console.log('\n🔔 Creating notifications...');
  const notificationsData = [
    { username: 'cb_pc02_1', taskIndex: 0,  isRead: false, title: 'Nhiệm vụ mới được giao', message: 'PC02 được giao chủ trì điều tra vụ trộm cắp tài sản có tổ chức tại khu công nghiệp' },
    { username: 'tp_pc09',   taskIndex: 0,  isRead: false, title: 'Nhiệm vụ phối hợp',      message: 'PC09 được giao phối hợp điều tra vụ trộm cắp tại khu công nghiệp, cần cử cán bộ tham gia khám nghiệm hiện trường' },
    { username: 'tp_pc04',   taskIndex: 1,  isRead: false, title: 'Nhiệm vụ mới được giao', message: 'PC04 được giao chủ trì triệt phá đường dây vận chuyển ma túy liên tỉnh' },
    { username: 'cb_pc08_1', taskIndex: 2,  isRead: false, title: 'Nhắc việc: Sắp đến hạn', message: 'Nhiệm vụ tuần tra ATGT đường bộ đến hạn trong 5 ngày, cần chuẩn bị kế hoạch triển khai' },
    { username: 'tp_pc07',   taskIndex: 3,  isRead: true,  title: 'Nhiệm vụ mới được giao', message: 'PC07 được giao chủ trì kiểm tra an toàn PCCC tại các cơ sở sản xuất kinh doanh' },
    { username: 'tp_ph01',   taskIndex: 15, isRead: false, title: 'Cảnh báo: Nhiệm vụ quá hạn', message: 'Nhiệm vụ Quyết toán ngân sách quý II/2026 đã quá hạn. Cần nộp bản giải trình ngay.' },
    { username: 'tp_pk02',   taskIndex: 9,  isRead: false, title: 'Nhiệm vụ khẩn cấp',     message: 'PK02 được giao bảo vệ Kỳ họp thứ 9 HĐND tỉnh, cần lên phương án triển khai ngay' },
    { username: 'tp_pv01',   taskIndex: 7,  isRead: true,  title: 'Nhắc việc: Sắp đến hạn', message: 'Nhiệm vụ xây dựng kế hoạch 6 tháng cuối năm còn 7 ngày, cần đẩy nhanh tiến độ' },
    { username: 'tp_pa05',   taskIndex: 4,  isRead: false, title: 'Nhiệm vụ mới được giao', message: 'PA05 được giao điều tra tội phạm lừa đảo chiếm đoạt tài sản qua mạng' },
    { username: 'tp_px01',   taskIndex: 6,  isRead: false, title: 'Nhiệm vụ mới được giao', message: 'PX01 được giao chủ trì đánh giá, xếp loại cán bộ chiến sĩ năm 2026' },
    { username: 'tp_pa02',   taskIndex: 11, isRead: false, title: 'Nhiệm vụ mới được giao', message: 'PA02 được giao chủ trì phòng chống tuyên truyền chống phá Nhà nước trên mạng xã hội' },
    { username: 'tp_pa04',   taskIndex: 16, isRead: false, title: 'Nhiệm vụ mới được giao', message: 'PA04 được giao điều tra vụ tham nhũng trong đấu thầu dự án đầu tư công' },
  ];

  for (const n of notificationsData) {
    const task = taskMap.get(n.taskIndex);
    const uid = userMap.get(n.username)?.id;
    if (uid && task) {
      await notificationRepository.save({ userId: uid, taskId: task.id, title: n.title, message: n.message, isRead: n.isRead });
      console.log(`  ✓ [${n.username}] ${n.title}`);
    }
  }

  // ───────────────────────────────────────────
  // SUMMARY
  // ───────────────────────────────────────────
  console.log('\n✅ Seed data hoàn thành!');
  console.log('\n📊 Tổng kết:');
  console.log(`  Đơn vị  : ${deptData.length}`);
  console.log(`  Người dùng: ${usersData.length}`);
  console.log(`  Công việc : ${tasksData.length}`);
  console.log(`  Kết quả   : ${resultsData.length}`);
  console.log(`  Thông báo : ${notificationsData.length}`);

  console.log('\n🔐 Tài khoản demo (mật khẩu: 123456):');
  console.log('  admin      → Quản trị hệ thống (Phòng Tham mưu - PV01)');
  console.log('  tp_pc02    → Trưởng phòng Cảnh sát hình sự (PC02)');
  console.log('  tp_pc04    → Trưởng phòng Cảnh sát ma túy (PC04)');
  console.log('  tp_pc08    → Trưởng phòng Cảnh sát giao thông (PC08)');
  console.log('  tp_pc07    → Trưởng phòng Cảnh sát PCCC (PC07)');
  console.log('  tp_pa05    → Trưởng phòng An ninh mạng (PA05)');
  console.log('  tp_ph01    → Trưởng phòng Tài chính (PH01)');
  console.log('  tp_pv01    → Trưởng phòng Tham mưu (PV01)');
  console.log('  cb_pc02_1  → Cán bộ Phòng Cảnh sát hình sự');
  console.log('  cb_pc04_1  → Cán bộ Phòng Cảnh sát ma túy');
  console.log('  ... (39 tài khoản, tất cả mật khẩu: 123456)');

  await dataSource.destroy();
}

seed().catch((error) => {
  console.error('Seed thất bại:', error);
  process.exit(1);
});
