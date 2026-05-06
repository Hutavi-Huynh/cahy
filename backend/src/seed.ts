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
    entities: [
      User,
      Department,
      Task,
      TaskResult,
      TaskHistory,
      TaskResultHistory,
      Notification,
      LoginLog,
    ],
    synchronize: true,
  });

  await dataSource.initialize();

  const userRepository = dataSource.getRepository(User);
  const deptRepository = dataSource.getRepository(Department);
  const taskRepository = dataSource.getRepository(Task);
  const taskResultRepository = dataSource.getRepository(TaskResult);
  const taskHistoryRepository = dataSource.getRepository(TaskHistory);
  const taskResultHistoryRepository =
    dataSource.getRepository(TaskResultHistory);
  const notificationRepository = dataSource.getRepository(Notification);
  const loginLogRepository = dataSource.getRepository(LoginLog);

  console.log('🌱 Starting seed data...\n');

  // Clear old task data
  console.log('🗑️  Clearing old task data...');
  await dataSource.query('DELETE FROM task_result_histories');
  await dataSource.query('DELETE FROM task_histories');
  await dataSource.query('DELETE FROM notifications');
  await dataSource.query('DELETE FROM login_logs');
  await dataSource.query('DELETE FROM task_results');
  await dataSource.query('DELETE FROM task_cooperating_departments');
  await dataSource.query('DELETE FROM tasks');
  console.log('  ✓ Cleared\n');

  // Create departments
  console.log('📁 Creating departments...');
  const deptData = [
    {
      code: 'CAO',
      name: 'Phòng Cảnh sát Hình sự',
      description: 'Phòng chuyên trách các vụ án hình sự, điều tra tội phạm',
    },
    {
      code: 'CATQ',
      name: 'Phòng Cảnh sát An toàn xã hội',
      description: 'Phòng đảm bảo trật tự an toàn cộng đồng, xử lý tệ nạn',
    },
    {
      code: 'CSGT',
      name: 'Phòng Cảnh sát Giao thông',
      description:
        'Phòng quản lý giao thông đường bộ, kiểm soát trật tự giao thông',
    },
    {
      code: 'CACD',
      name: 'Phòng Cảnh sát Cơ động',
      description: 'Phòng xử lý các sự cố cấp bách, bảo vệ an toàn lễ hội',
    },
    {
      code: 'HSKT',
      name: 'Phòng Hồ sơ - Kế toán',
      description: 'Phòng quản lý hành chính, tài chính, lưu trữ',
    },
    {
      code: 'PCCC',
      name: 'Phòng Phòng chống và Cứu nạn Cứu hộ',
      description: 'Phòng chuyên trách phòng cháy chữa cháy, cứu nạn cứu hộ',
    },
    {
      code: 'QLTT',
      name: 'Phòng Quản lý Thị trường',
      description: 'Phòng quản lý thị trường, chống buôn lậu',
    },
    {
      code: 'BLNN',
      name: 'Phòng Bảo vệ Lâm nghiệp và Tài nguyên',
      description: 'Phòng quản lý bảo vệ rừng, tài nguyên thiên nhiên',
    },
    {
      code: 'CNHC',
      name: 'Phòng Cảnh sát Nước Hình sự',
      description: 'Phòng quản lý vùng nước, điều tra tội phạm trên biển',
    },
    {
      code: 'TCDH',
      name: 'Phòng Tác chiến và Điều tra tội phạm Ma tuý',
      description: 'Phòng chuyên trách điều tra tội phạm ma tuý, pháo',
    },
    {
      code: 'ATKT',
      name: 'Phòng An toàn Kinh tế',
      description: 'Phòng điều tra tội phạm kinh tế, gian lận thương mại',
    },
    {
      code: 'SCTP',
      name: 'Phòng Sinh cảnh Trị an Phòng chống tội phạm',
      description: 'Phòng chủ trì công tác phòng ngừa tội phạm sinh cảnh',
    },
    {
      code: 'CVKT',
      name: 'Phòng Cảnh vệ và Kiểm soát thủ kho',
      description: 'Phòng bảo vệ các kho tàng, công sở chính phủ',
    },
    {
      code: 'TTTH',
      name: 'Phòng Thông tấn Thông tin',
      description: 'Phòng quản lý thông tin, truyền thông nội bộ',
    },
    {
      code: 'DANH',
      name: 'Phòng Đào tạo và Ngoại hành',
      description: 'Phòng đào tạo cán bộ, tuyên truyền giáo dục',
    },
  ];

  for (const dept of deptData) {
    const exists = await deptRepository.findOne({ where: { code: dept.code } });
    if (!exists) {
      await deptRepository.save({
        ...dept,
        isActive: true,
      });
      console.log(`  ✓ Created department: ${dept.code} - ${dept.name}`);
    } else {
      console.log(`  ✓ Department exists: ${dept.code}`);
    }
  }

  const allDepartments = await deptRepository.find();

  // Helper: lookup department by code
  const byCode = (code: string) =>
    allDepartments.find((dep) => dep.code === code);

  // Create users
  console.log('\n👤 Creating users...');
  const hashedPassword = await bcrypt.hash('123456', 10);

  const usersData = [
    // Admin — thuộc phòng HSKT (hành chính quản trị)
    {
      username: 'admin',
      fullName: 'Nguyễn Văn Admin',
      role: Role.ADMIN,
      deptCode: 'HSKT',
    },
    // CAO - Cảnh sát Hình sự
    {
      username: 'truong_cao',
      fullName: 'Trương Văn An',
      role: Role.UNIT_LEAD,
      deptCode: 'CAO',
    },
    {
      username: 'cshs1',
      fullName: 'Lê Thị Bích',
      role: Role.UNIT_MEMBER,
      deptCode: 'CAO',
    },
    {
      username: 'cshs2',
      fullName: 'Phạm Văn Cường',
      role: Role.UNIT_MEMBER,
      deptCode: 'CAO',
    },
    // CATQ - Cảnh sát An toàn xã hội
    {
      username: 'truong_catq',
      fullName: 'Đặng Thị Dung',
      role: Role.UNIT_LEAD,
      deptCode: 'CATQ',
    },
    {
      username: 'csatxh1',
      fullName: 'Vũ Văn Em',
      role: Role.UNIT_MEMBER,
      deptCode: 'CATQ',
    },
    {
      username: 'csatxh2',
      fullName: 'Ngô Thị Phương',
      role: Role.UNIT_MEMBER,
      deptCode: 'CATQ',
    },
    // CSGT - Cảnh sát Giao thông
    {
      username: 'truong_csgt',
      fullName: 'Bùi Văn Giang',
      role: Role.UNIT_LEAD,
      deptCode: 'CSGT',
    },
    {
      username: 'csgt1',
      fullName: 'Hoàng Thị Hoa',
      role: Role.UNIT_MEMBER,
      deptCode: 'CSGT',
    },
    {
      username: 'csgt2',
      fullName: 'Phan Văn Hùng',
      role: Role.UNIT_MEMBER,
      deptCode: 'CSGT',
    },
    // CACD - Cảnh sát Cơ động
    {
      username: 'truong_cacd',
      fullName: 'Đinh Văn Khoa',
      role: Role.UNIT_LEAD,
      deptCode: 'CACD',
    },
    {
      username: 'cacd1',
      fullName: 'Trần Thị Lan',
      role: Role.UNIT_MEMBER,
      deptCode: 'CACD',
    },
    {
      username: 'cacd2',
      fullName: 'Hồ Văn Long',
      role: Role.UNIT_MEMBER,
      deptCode: 'CACD',
    },
    // HSKT - Hồ sơ Kế toán
    {
      username: 'truong_hskt',
      fullName: 'Lý Thị Mai',
      role: Role.UNIT_LEAD,
      deptCode: 'HSKT',
    },
    {
      username: 'hskt1',
      fullName: 'Nguyễn Văn Nam',
      role: Role.UNIT_MEMBER,
      deptCode: 'HSKT',
    },
    // PCCC - Phòng cháy chữa cháy
    {
      username: 'truong_pccc',
      fullName: 'Võ Văn Minh',
      role: Role.UNIT_LEAD,
      deptCode: 'PCCC',
    },
    {
      username: 'pccc1',
      fullName: 'Dương Thị Ngân',
      role: Role.UNIT_MEMBER,
      deptCode: 'PCCC',
    },
    // QLTT - Quản lý Thị trường
    {
      username: 'truong_qltt',
      fullName: 'Lâm Văn Oanh',
      role: Role.UNIT_LEAD,
      deptCode: 'QLTT',
    },
    {
      username: 'qltt1',
      fullName: 'Giang Thị Phúc',
      role: Role.UNIT_MEMBER,
      deptCode: 'QLTT',
    },
    // BLNN - Bảo vệ Lâm nghiệp
    {
      username: 'truong_blnn',
      fullName: 'Quốc Văn Quang',
      role: Role.UNIT_LEAD,
      deptCode: 'BLNN',
    },
    {
      username: 'blnn1',
      fullName: 'Huỳnh Thị Ry',
      role: Role.UNIT_MEMBER,
      deptCode: 'BLNN',
    },
    // CNHC - Cảnh sát Nước Hình sự
    {
      username: 'truong_cnhc',
      fullName: 'Sơn Văn Sáng',
      role: Role.UNIT_LEAD,
      deptCode: 'CNHC',
    },
    {
      username: 'cnhc1',
      fullName: 'Mai Thị Thu',
      role: Role.UNIT_MEMBER,
      deptCode: 'CNHC',
    },
    // TCDH - Điều tra Ma tuý
    {
      username: 'truong_tcdh',
      fullName: 'Thái Văn Uy',
      role: Role.UNIT_LEAD,
      deptCode: 'TCDH',
    },
    {
      username: 'tcdh1',
      fullName: 'Xuân Thị Vân',
      role: Role.UNIT_MEMBER,
      deptCode: 'TCDH',
    },
    // ATKT - An toàn Kinh tế
    {
      username: 'truong_atkt',
      fullName: 'Tùng Văn Wân',
      role: Role.UNIT_LEAD,
      deptCode: 'ATKT',
    },
    {
      username: 'atkt1',
      fullName: 'Yên Thị Xuân',
      role: Role.UNIT_MEMBER,
      deptCode: 'ATKT',
    },
    // SCTP - Sinh cảnh Trị an
    {
      username: 'truong_sctp',
      fullName: 'Úc Văn Yên',
      role: Role.UNIT_LEAD,
      deptCode: 'SCTP',
    },
    {
      username: 'sctp1',
      fullName: 'Bảo Thị Yến',
      role: Role.UNIT_MEMBER,
      deptCode: 'SCTP',
    },
    // CVKT - Cảnh vệ
    {
      username: 'truong_cvkt',
      fullName: 'Á Văn Zân',
      role: Role.UNIT_LEAD,
      deptCode: 'CVKT',
    },
    {
      username: 'cvkt1',
      fullName: 'Cẩm Thị Zung',
      role: Role.UNIT_MEMBER,
      deptCode: 'CVKT',
    },
    // TTTH - Thông tấn Thông tin
    {
      username: 'truong_ttth',
      fullName: 'Bình Văn Tâm',
      role: Role.UNIT_LEAD,
      deptCode: 'TTTH',
    },
    {
      username: 'ttth1',
      fullName: 'Diệu Thị Thảo',
      role: Role.UNIT_MEMBER,
      deptCode: 'TTTH',
    },
    // DANH - Đào tạo
    {
      username: 'truong_danh',
      fullName: 'Chương Văn Thịnh',
      role: Role.UNIT_LEAD,
      deptCode: 'DANH',
    },
    {
      username: 'danh1',
      fullName: 'Hiếu Thị Trang',
      role: Role.UNIT_MEMBER,
      deptCode: 'DANH',
    },
  ];

  const userMap = new Map<string, User>();
  for (const userData of usersData) {
    const exists = await userRepository.findOne({
      where: { username: userData.username },
    });
    if (!exists) {
      const user = await userRepository.save({
        username: userData.username,
        fullName: userData.fullName,
        password: hashedPassword,
        role: userData.role,
        departmentId: byCode(userData.deptCode)?.id,
        isActive: true,
      });
      userMap.set(userData.username, user);
      console.log(
        `  ✓ Created user: ${userData.username} - ${userData.fullName}`,
      );
    } else {
      // Sync departmentId nếu thiếu hoặc sai
      const deptId = byCode(userData.deptCode)?.id;
      if (deptId && exists.departmentId !== deptId) {
        await userRepository.update(exists.id, { departmentId: deptId });
        exists.departmentId = deptId;
      }
      userMap.set(userData.username, exists);
      console.log(
        `  ✓ User exists: ${userData.username} [${userData.deptCode}]`,
      );
    }
  }

  const dept = byCode;
  const adminId = userMap.get('admin')?.id;

  // Create tasks
  console.log('\n📋 Creating tasks...');

  interface TaskSeed {
    title: string;
    content: string;
    expectedResult: string;
    leadCode: string;
    cooperatingCodes?: string[];
    status: TaskStatus;
    frequency: TaskFrequency;
    deadlineDays: number; // relative days from now (negative = past)
    reminderBefore?: number;
    linhVuc?: string;
  }

  const tasksData: TaskSeed[] = [
    // CAO - Cảnh sát Hình sự
    {
      title: 'Điều tra vụ trộm cắp tài sản tại phường Hòa Phú',
      content:
        'Điều tra chi tiết vụ trộm tài sản tại khu dân cư, lấy lời khai nhân chứng, thu thập chứng cứ camera an ninh.',
      expectedResult: 'Xác định và bắt giữ nghi phạm, lập hồ sơ chuyển VKS.',
      leadCode: 'CAO',
      cooperatingCodes: ['CATQ'],
      status: TaskStatus.IN_PROGRESS,
      frequency: TaskFrequency.ONCE,
      deadlineDays: 7,
      reminderBefore: 2,
      linhVuc: 'Điều tra hình sự',
    },
    {
      title: 'Điều tra vụ cố ý gây thương tích tại xã Tân Bình',
      content:
        'Lấy lời khai các bên liên quan, giám định thương tích, xác định nguyên nhân và động cơ vụ việc.',
      expectedResult: 'Hoàn thành điều tra, chuyển hồ sơ khởi tố sang VKS.',
      leadCode: 'CAO',
      status: TaskStatus.COMPLETED,
      frequency: TaskFrequency.ONCE,
      deadlineDays: -5,
      linhVuc: 'Điều tra hình sự',
    },
    {
      title: 'Tập huấn kỹ năng điều tra và thu thập chứng cứ',
      content:
        'Đào tạo cán bộ về kỹ thuật lấy lời khai, bảo quản hiện trường, lập hồ sơ vụ án theo quy trình mới.',
      expectedResult: 'Đào tạo ít nhất 20 cán bộ đạt yêu cầu.',
      leadCode: 'CAO',
      cooperatingCodes: ['DANH'],
      status: TaskStatus.PENDING,
      frequency: TaskFrequency.QUARTERLY,
      deadlineDays: 30,
      reminderBefore: 7,
      linhVuc: 'Đào tạo - Huấn luyện',
    },
    // CATQ - Cảnh sát An toàn xã hội
    {
      title: 'Kiểm tra an ninh trật tự tại chợ trung tâm',
      content:
        'Tăng cường tuần tra, ngăn chặn trộm cắp, đảm bảo trật tự mua bán tại khu vực chợ trung tâm.',
      expectedResult:
        'Không có sự cố mất trật tự, lập biên bản xử lý vi phạm nếu có.',
      leadCode: 'CATQ',
      cooperatingCodes: ['CSGT'],
      status: TaskStatus.PENDING,
      frequency: TaskFrequency.WEEKLY,
      deadlineDays: 5,
      reminderBefore: 2,
      linhVuc: 'An ninh trật tự',
    },
    {
      title: 'Báo cáo tổng hợp tình hình tệ nạn xã hội quý II',
      content:
        'Tổng hợp số liệu về tệ nạn xã hội, phân tích xu hướng, đề xuất biện pháp phòng ngừa.',
      expectedResult: 'Báo cáo đầy đủ số liệu, được lãnh đạo phê duyệt.',
      leadCode: 'CATQ',
      cooperatingCodes: ['SCTP'],
      status: TaskStatus.OVERDUE,
      frequency: TaskFrequency.QUARTERLY,
      deadlineDays: -3,
      reminderBefore: 3,
      linhVuc: 'An ninh trật tự',
    },
    // CSGT - Cảnh sát Giao thông
    {
      title: 'Tuần tra kiểm soát giao thông trên quốc lộ 1A',
      content:
        'Tổ chức tuần tra, kiểm tra phương tiện vi phạm luật giao thông, lập biên bản xử phạt.',
      expectedResult:
        'Lập ít nhất 10 biên bản xử phạt/ngày, đảm bảo trật tự an toàn giao thông.',
      leadCode: 'CSGT',
      status: TaskStatus.IN_PROGRESS,
      frequency: TaskFrequency.WEEKLY,
      deadlineDays: 3,
      reminderBefore: 1,
      linhVuc: 'Trật tự an toàn giao thông',
    },
    {
      title: 'Xử lý điểm đen tai nạn giao thông tại ngã tư Trung tâm',
      content:
        'Khảo sát, lập phương án xử lý điểm đen tai nạn, đề xuất cải tạo hạ tầng giao thông.',
      expectedResult: 'Có biện pháp xử lý kịp thời, giảm nguy cơ tai nạn.',
      leadCode: 'CSGT',
      cooperatingCodes: ['CACD'],
      status: TaskStatus.PENDING,
      frequency: TaskFrequency.ONCE,
      deadlineDays: 14,
      reminderBefore: 3,
      linhVuc: 'Trật tự an toàn giao thông',
    },
    // CACD - Cảnh sát Cơ động
    {
      title: 'Bảo vệ an ninh Lễ hội Văn hóa tỉnh',
      content:
        'Triển khai lực lượng đảm bảo an ninh trật tự trong suốt thời gian diễn ra lễ hội, phối hợp xử lý tình huống.',
      expectedResult: 'Lễ hội diễn ra an toàn, không có sự cố mất an ninh.',
      leadCode: 'CACD',
      cooperatingCodes: ['CSGT', 'CATQ'],
      status: TaskStatus.PENDING,
      frequency: TaskFrequency.ONCE,
      deadlineDays: 10,
      reminderBefore: 2,
      linhVuc: 'An ninh trật tự',
    },
    // HSKT - Hồ sơ Kế toán
    {
      title: 'Báo cáo tài chính và quyết toán quý I/2026',
      content:
        'Tổng hợp thu chi, lập báo cáo tài chính quý I, quyết toán các khoản chi phát sinh.',
      expectedResult:
        'Báo cáo tài chính hoàn chỉnh, được kiểm toán và phê duyệt.',
      leadCode: 'HSKT',
      cooperatingCodes: ['TTTH'],
      status: TaskStatus.PENDING,
      frequency: TaskFrequency.QUARTERLY,
      deadlineDays: 2,
      reminderBefore: 1,
      linhVuc: 'Hành chính - Tài chính',
    },
    {
      title: 'Cập nhật và rà soát hồ sơ cán bộ toàn đơn vị',
      content:
        'Kiểm tra, cập nhật hồ sơ nhân sự, tài liệu lưu trữ; sắp xếp theo đúng quy định.',
      expectedResult:
        'Toàn bộ hồ sơ được cập nhật, sắp xếp khoa học, đúng quy định.',
      leadCode: 'HSKT',
      status: TaskStatus.IN_PROGRESS,
      frequency: TaskFrequency.MONTHLY,
      deadlineDays: 10,
      reminderBefore: 3,
      linhVuc: 'Hành chính - Tài chính',
    },
    // PCCC - Phòng cháy chữa cháy
    {
      title: 'Kiểm tra công tác PCCC tại các cơ sở kinh doanh',
      content:
        'Kiểm tra thiết bị PCCC, lối thoát hiểm, biển báo; lập biên bản xử lý vi phạm nếu có.',
      expectedResult:
        'Kiểm tra ít nhất 20 cơ sở, xử lý 100% vi phạm được phát hiện.',
      leadCode: 'PCCC',
      status: TaskStatus.IN_PROGRESS,
      frequency: TaskFrequency.MONTHLY,
      deadlineDays: 8,
      reminderBefore: 2,
      linhVuc: 'Phòng cháy chữa cháy',
    },
    {
      title: 'Diễn tập phương án chữa cháy và cứu nạn khu công nghiệp',
      content:
        'Tổ chức diễn tập thực tế tại khu công nghiệp, kiểm tra phương án, nâng cao năng lực ứng phó.',
      expectedResult:
        'Diễn tập thành công, rút kinh nghiệm và cập nhật phương án.',
      leadCode: 'PCCC',
      cooperatingCodes: ['CACD'],
      status: TaskStatus.PENDING,
      frequency: TaskFrequency.QUARTERLY,
      deadlineDays: 20,
      reminderBefore: 5,
      linhVuc: 'Phòng cháy chữa cháy',
    },
    // QLTT - Quản lý Thị trường
    {
      title: 'Kiểm tra hàng hóa nhập lậu tại các cửa hàng',
      content:
        'Thanh tra, kiểm tra nguồn gốc hàng hóa, xử lý hàng nhập lậu, hàng kém chất lượng.',
      expectedResult:
        'Kiểm tra ít nhất 15 cơ sở, tịch thu hàng vi phạm nếu có.',
      leadCode: 'QLTT',
      cooperatingCodes: ['ATKT'],
      status: TaskStatus.PENDING,
      frequency: TaskFrequency.MONTHLY,
      deadlineDays: 12,
      reminderBefore: 3,
      linhVuc: 'Kinh tế - Thương mại',
    },
    // BLNN - Bảo vệ Lâm nghiệp
    {
      title: 'Tuần tra bảo vệ rừng khu vực phía Bắc',
      content:
        'Tổ chức tuần tra rừng, phát hiện và xử lý vi phạm khai thác trái phép, ngăn chặn cháy rừng.',
      expectedResult:
        'Không có vụ khai thác rừng trái phép, phát hiện sớm nguy cơ cháy rừng.',
      leadCode: 'BLNN',
      status: TaskStatus.IN_PROGRESS,
      frequency: TaskFrequency.WEEKLY,
      deadlineDays: 4,
      reminderBefore: 1,
      linhVuc: 'Tài nguyên - Môi trường',
    },
    // CNHC - Cảnh sát Nước Hình sự
    {
      title: 'Tuần tra kiểm soát vùng nước nội địa',
      content:
        'Tuần tra trên các sông, hồ; kiểm tra giấy tờ phương tiện thủy; xử lý vi phạm.',
      expectedResult:
        'Đảm bảo trật tự an toàn giao thông đường thủy, không có sự cố.',
      leadCode: 'CNHC',
      status: TaskStatus.PENDING,
      frequency: TaskFrequency.WEEKLY,
      deadlineDays: 6,
      reminderBefore: 1,
      linhVuc: 'Trật tự an toàn giao thông',
    },
    // TCDH - Điều tra Ma tuý
    {
      title: 'Điều tra đường dây vận chuyển ma tuý liên tỉnh',
      content:
        'Trinh sát, thu thập thông tin, phối hợp điều tra đường dây buôn bán, vận chuyển ma túy.',
      expectedResult: 'Triệt phá đường dây, bắt giữ các đối tượng liên quan.',
      leadCode: 'TCDH',
      cooperatingCodes: ['CAO'],
      status: TaskStatus.IN_PROGRESS,
      frequency: TaskFrequency.ONCE,
      deadlineDays: 15,
      reminderBefore: 3,
      linhVuc: 'Phòng chống ma tuý',
    },
    // ATKT - An toàn Kinh tế
    {
      title: 'Điều tra vụ gian lận thương mại tại doanh nghiệp X',
      content:
        'Thu thập chứng cứ, làm việc với các bên liên quan, xác định hành vi gian lận và thiệt hại.',
      expectedResult:
        'Lập hồ sơ vụ án, đề xuất khởi tố hoặc xử phạt hành chính.',
      leadCode: 'ATKT',
      cooperatingCodes: ['QLTT'],
      status: TaskStatus.PENDING,
      frequency: TaskFrequency.ONCE,
      deadlineDays: 18,
      reminderBefore: 5,
      linhVuc: 'Kinh tế - Thương mại',
    },
    // SCTP - Sinh cảnh Trị an
    {
      title: 'Triển khai chiến dịch phòng ngừa tội phạm khu dân cư',
      content:
        'Tổ chức tuyên truyền pháp luật, vận động nhân dân tham gia phòng chống tội phạm tại địa bàn.',
      expectedResult:
        'Tổ chức ít nhất 5 buổi tuyên truyền, giảm tội phạm địa bàn.',
      leadCode: 'SCTP',
      cooperatingCodes: ['CATQ', 'CAO'],
      status: TaskStatus.PENDING,
      frequency: TaskFrequency.MONTHLY,
      deadlineDays: 22,
      reminderBefore: 5,
      linhVuc: 'Phòng ngừa tội phạm',
    },
    // CVKT - Cảnh vệ
    {
      title: 'Kiểm tra an ninh kho vũ khí và trang thiết bị',
      content:
        'Kiểm kê, đối chiếu số lượng, kiểm tra tình trạng bảo quản vũ khí và trang thiết bị trong kho.',
      expectedResult:
        'Báo cáo kiểm kê đầy đủ, phát hiện và xử lý ngay nếu có sai sót.',
      leadCode: 'CVKT',
      status: TaskStatus.COMPLETED,
      frequency: TaskFrequency.MONTHLY,
      deadlineDays: -2,
      linhVuc: 'An ninh nội bộ',
    },
    // TTTH - Thông tấn Thông tin
    {
      title: 'Cập nhật và bảo trì hệ thống thông tin nội bộ',
      content:
        'Kiểm tra, nâng cấp phần mềm, sao lưu dữ liệu, đảm bảo hệ thống thông tin hoạt động ổn định.',
      expectedResult:
        'Hệ thống hoạt động ổn định 100%, dữ liệu được sao lưu đầy đủ.',
      leadCode: 'TTTH',
      status: TaskStatus.IN_PROGRESS,
      frequency: TaskFrequency.MONTHLY,
      deadlineDays: 9,
      reminderBefore: 2,
      linhVuc: 'Công nghệ thông tin',
    },
    // DANH - Đào tạo
    {
      title: 'Tổ chức lớp bồi dưỡng chính trị cho cán bộ',
      content:
        'Tổ chức lớp học bồi dưỡng nghiệp vụ, lý luận chính trị cho toàn thể cán bộ theo kế hoạch năm.',
      expectedResult:
        'Ít nhất 80% cán bộ hoàn thành chương trình bồi dưỡng, đạt yêu cầu.',
      leadCode: 'DANH',
      status: TaskStatus.PENDING,
      frequency: TaskFrequency.QUARTERLY,
      deadlineDays: 25,
      reminderBefore: 7,
      linhVuc: 'Đào tạo - Huấn luyện',
    },
  ];

  const taskMap = new Map<number, Task>();
  for (let i = 0; i < tasksData.length; i++) {
    const td = tasksData[i];
    const existingTask = await taskRepository.findOne({
      where: { title: td.title },
    });
    if (!existingTask) {
      const leadDept = dept(td.leadCode);
      const cooperatingDepts = (td.cooperatingCodes ?? [])
        .map((c) => dept(c))
        .filter(Boolean) as Department[];

      const deadline = new Date(
        Date.now() + td.deadlineDays * 24 * 60 * 60 * 1000,
      );
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
        ...(td.reminderBefore !== undefined && {
          reminderBefore: td.reminderBefore,
        }),
      });
      const saved = await taskRepository.save(task);
      taskMap.set(i, saved);
      const coopNames = cooperatingDepts.map((d) => d.code).join(', ');
      console.log(
        `  ✓ [${td.leadCode}${coopNames ? ' + ' + coopNames : ''}] ${td.title}`,
      );
    } else {
      taskMap.set(i, existingTask);
      console.log(`  ✓ Task exists: ${td.title}`);
    }
  }

  // Create task results
  console.log('\n📊 Creating task results...');
  const resultsData = [
    // Task 0: Điều tra vụ trộm (CAO chủ trì, CATQ phối hợp)
    {
      taskIndex: 0,
      deptCode: 'CAO',
      content:
        'Đã phỏng vấn 5 nhân chứng, thu thập 3 đoạn video camera an ninh, xác định được 2 nghi phạm.',
      completionRate: 40,
      username: 'cshs1',
    },
    {
      taskIndex: 0,
      deptCode: 'CATQ',
      content:
        'Đã kiểm tra khu vực xung quanh hiện trường, không phát hiện đối tượng liên quan khác.',
      completionRate: 30,
      username: 'csatxh1',
    },
    // Task 1: Điều tra cố ý gây thương tích (hoàn thành)
    {
      taskIndex: 1,
      deptCode: 'CAO',
      content:
        'Vụ án hoàn tất điều tra, bị can đã bị bắt, hồ sơ đã chuyển sang VKS để khởi tố.',
      completionRate: 100,
      username: 'cshs2',
    },
    // Task 5: Tuần tra CSGT
    {
      taskIndex: 5,
      deptCode: 'CSGT',
      content:
        'Tuần tra từ 6h–18h, lập 12 biên bản tốc độ, 8 biên bản không đội mũ bảo hiểm.',
      completionRate: 50,
      username: 'csgt1',
    },
    // Task 9: Hồ sơ kế toán
    {
      taskIndex: 9,
      deptCode: 'HSKT',
      content:
        'Đã rà soát 60% hồ sơ cán bộ, đang tiến hành cập nhật phần còn lại.',
      completionRate: 60,
      username: 'admin',
    },
    // Task 10: PCCC
    {
      taskIndex: 10,
      deptCode: 'PCCC',
      content:
        'Đã kiểm tra 14/20 cơ sở, phát hiện 3 cơ sở vi phạm về bình chữa cháy, đã lập biên bản.',
      completionRate: 70,
      username: 'truong_pccc',
    },
    // Task 13: BLNN
    {
      taskIndex: 13,
      deptCode: 'BLNN',
      content:
        'Tuần tra 4 tuyến đường rừng phía Bắc, không phát hiện vi phạm khai thác trái phép.',
      completionRate: 30,
      username: 'blnn1',
    },
    // Task 16: CVKT (hoàn thành)
    {
      taskIndex: 16,
      deptCode: 'CVKT',
      content:
        'Hoàn thành kiểm kê toàn bộ kho, số lượng đủ, tình trạng bảo quản tốt. Báo cáo đã nộp lãnh đạo.',
      completionRate: 100,
      username: 'truong_cvkt',
    },
    // Task 17: TTTH
    {
      taskIndex: 17,
      deptCode: 'TTTH',
      content:
        'Đã cập nhật phần mềm cho 80% máy trạm, sao lưu dữ liệu hoàn tất, đang xử lý 2 sự cố nhỏ.',
      completionRate: 80,
      username: 'truong_ttth',
    },
  ];

  for (const r of resultsData) {
    const task = taskMap.get(r.taskIndex);
    const deptObj = dept(r.deptCode);
    const submitter = userMap.get(r.username);
    if (task && deptObj) {
      const exists = await taskResultRepository.findOne({
        where: { taskId: task.id, departmentId: deptObj.id },
      });
      if (!exists) {
        await taskResultRepository.save({
          taskId: task.id,
          departmentId: deptObj.id,
          content: r.content,
          completionRate: r.completionRate,
          submittedById: submitter?.id,
        });
        console.log(
          `  ✓ Result [${r.deptCode}] → ${task.title.substring(0, 35)}...`,
        );
      }
    }
  }

  // Create task history
  console.log('\n📝 Creating task history...');
  const taskHistoriesData = [
    {
      taskIndex: 4,
      changedById: userMap.get('admin')?.id,
      changeDescription: 'Gia hạn thời hạn từ 05/05/2026 đến 10/05/2026',
      oldValue: { deadline: '2026-05-05' },
      newValue: { deadline: '2026-05-10' },
    },
    {
      taskIndex: 5,
      changedById: userMap.get('admin')?.id,
      changeDescription: 'Cập nhật nội dung công việc',
      oldValue: { content: 'Kiểm tra hồ sơ cán bộ' },
      newValue: {
        content: 'Kiểm tra, cập nhật hồ sơ cán bộ và tài liệu lưu trữ',
      },
    },
  ];

  for (const historyData of taskHistoriesData) {
    const task = taskMap.get(historyData.taskIndex);
    if (task && historyData.changedById) {
      await taskHistoryRepository.save({
        taskId: task.id,
        changedById: historyData.changedById,
        changeDescription: historyData.changeDescription,
        oldValue: historyData.oldValue,
        newValue: historyData.newValue,
        changedAt: new Date(),
      });
      console.log(
        `  ✓ Created history for task: ${task.title.substring(0, 30)}...`,
      );
    }
  }

  // Create task result history
  console.log('\n📊 Creating task result history...');
  const results = await taskResultRepository.find();
  for (let i = 0; i < Math.min(2, results.length); i++) {
    const result = results[i];
    await taskResultHistoryRepository.save({
      taskResultId: result.id,
      updatedById: result.submittedById,
      content: 'Cập nhật: ' + result.content.substring(0, 50) + '...',
      completionRate: result.completionRate,
      attachments: result.attachments || [],
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    });
    console.log(`  ✓ Created result history for result ID: ${result.id}`);
  }

  // Create login logs
  console.log('\n🔐 Creating login logs...');
  const loginUsersData = [
    { userId: userMap.get('admin')?.id, isSuccess: true },
    { userId: userMap.get('truong_cao')?.id, isSuccess: true },
    { userId: userMap.get('cshs1')?.id, isSuccess: true },
    {
      userId: userMap.get('truong_csgt')?.id,
      isSuccess: false,
      failureReason: 'Invalid password',
    },
    { userId: userMap.get('admin')?.id, isSuccess: true },
  ];

  for (let i = 0; i < loginUsersData.length; i++) {
    const loginData = loginUsersData[i];
    if (loginData.userId) {
      const loginPayload: any = {
        userId: loginData.userId,
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        isSuccess: loginData.isSuccess,
        loginAt: new Date(Date.now() - (5 - i) * 60 * 60 * 1000),
        ...(loginData.failureReason && {
          failureReason: loginData.failureReason,
        }),
      };
      await loginLogRepository.save(loginPayload);
      console.log(
        `  ✓ Created login log: ${loginData.isSuccess ? 'Success' : 'Failed'}`,
      );
    }
  }

  // Create notifications
  console.log('\n🔔 Creating notifications...');
  const notificationsData = [
    {
      username: 'cshs1',
      taskIndex: 0,
      title: 'Nhiệm vụ mới được giao',
      message:
        'Bạn được giao nhiệm vụ: Điều tra vụ trộm cắp tài sản tại phường Hòa Phú',
      isRead: false,
    },
    {
      username: 'csatxh1',
      taskIndex: 0,
      title: 'Nhiệm vụ phối hợp',
      message:
        'Phòng bạn được giao phối hợp thực hiện nhiệm vụ điều tra vụ trộm cắp',
      isRead: false,
    },
    {
      username: 'cshs1',
      taskIndex: 1,
      title: 'Nhiệm vụ hoàn thành',
      message: 'Nhiệm vụ "Điều tra vụ cố ý gây thương tích" đã hoàn thành',
      isRead: true,
    },
    {
      username: 'csgt1',
      taskIndex: 5,
      title: 'Nhắc nhở: Sắp đến hạn',
      message: 'Nhiệm vụ tuần tra giao thông sắp đến hạn trong 3 ngày',
      isRead: false,
    },
    {
      username: 'csatxh1',
      taskIndex: 3,
      title: 'Nhiệm vụ mới được giao',
      message:
        'Bạn được giao nhiệm vụ: Kiểm tra an ninh trật tự tại chợ trung tâm',
      isRead: false,
    },
    {
      username: 'truong_catq',
      taskIndex: 4,
      title: 'Cảnh báo: Nhiệm vụ quá hạn',
      message:
        'Nhiệm vụ "Báo cáo tệ nạn xã hội quý II" đã quá hạn, cần giải trình',
      isRead: false,
    },
    {
      username: 'truong_pccc',
      taskIndex: 10,
      title: 'Nhiệm vụ mới được giao',
      message:
        'Bạn được giao nhiệm vụ: Kiểm tra công tác PCCC tại các cơ sở kinh doanh',
      isRead: true,
    },
    {
      username: 'blnn1',
      taskIndex: 13,
      title: 'Nhiệm vụ mới được giao',
      message: 'Bạn được giao nhiệm vụ: Tuần tra bảo vệ rừng khu vực phía Bắc',
      isRead: false,
    },
    {
      username: 'truong_tcdh',
      taskIndex: 15,
      title: 'Nhiệm vụ mới được giao',
      message: 'Bạn được giao nhiệm vụ: Điều tra đường dây ma tuý liên tỉnh',
      isRead: false,
    },
    {
      username: 'truong_cao',
      taskIndex: 15,
      title: 'Nhiệm vụ phối hợp',
      message:
        'Phòng bạn được giao phối hợp điều tra đường dây vận chuyển ma tuý',
      isRead: false,
    },
  ];

  for (const n of notificationsData) {
    const task = taskMap.get(n.taskIndex);
    const uid = userMap.get(n.username)?.id;
    if (uid && task) {
      const exists = await notificationRepository.findOne({
        where: { userId: uid, title: n.title },
      });
      if (!exists) {
        await notificationRepository.save({
          userId: uid,
          taskId: task.id,
          title: n.title,
          message: n.message,
          isRead: n.isRead,
        });
        console.log(`  ✓ [${n.username}] ${n.title}`);
      }
    }
  }

  const taskHistories = await taskHistoryRepository.find();
  const taskResultHistories = await taskResultHistoryRepository.find();
  const loginLogs = await loginLogRepository.find();

  console.log('\n✅ Seed data completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`  Departments: ${allDepartments.length}`);
  console.log(`  Users: ${userMap.size}`);
  console.log(`  Tasks: ${taskMap.size}`);
  console.log(`  Task Results: ${results.length}`);
  console.log(`  Task Histories: ${taskHistories.length}`);
  console.log(`  Task Result Histories: ${taskResultHistories.length}`);
  console.log(`  Login Logs: ${loginLogs.length}`);
  console.log(`  Notifications: 5`);
  console.log('\n🔐 Tài khoản mặc định (mật khẩu: 123456):');
  console.log('  admin        → Quản trị hệ thống (xem tất cả)');
  console.log('  truong_cao   → Phụ trách CAO  (thấy: task 0,1,2,15)');
  console.log('  cshs1        → Cán bộ CAO     (thấy: task 0,1,2,15)');
  console.log('  truong_catq  → Phụ trách CATQ (thấy: task 0,3,4,17)');
  console.log('  csatxh1      → Cán bộ CATQ    (thấy: task 0,3,4,17)');
  console.log('  truong_csgt  → Phụ trách CSGT (thấy: task 5,6,7)');
  console.log('  csgt1        → Cán bộ CSGT    (thấy: task 5,6,7)');
  console.log('  truong_cacd  → Phụ trách CACD (thấy: task 6,7)');
  console.log('  truong_pccc  → Phụ trách PCCC (thấy: task 10,11)');
  console.log('  truong_qltt  → Phụ trách QLTT (thấy: task 12,16)');
  console.log('  truong_tcdh  → Phụ trách TCDH (thấy: task 15)');
  console.log('  truong_atkt  → Phụ trách ATKT (thấy: task 12,16)');

  await dataSource.destroy();
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
