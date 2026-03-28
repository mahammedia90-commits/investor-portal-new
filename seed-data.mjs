/**
 * Seed Data Script for Investor Portal
 * Creates realistic data for Maham Expo investor dashboard
 * Run: node seed-data.mjs
 */

import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const conn = await mysql.createConnection(DATABASE_URL);

// Owner user ID = 1 (Nour)
const INVESTOR_ID = 1;

async function seed() {
  console.log('🌱 Starting seed data...');

  // ============================================
  // 1. EXHIBITIONS (معارض)
  // ============================================
  console.log('📦 Seeding exhibitions...');
  await conn.execute(`INSERT INTO exhibitions (investorId, name, nameEn, description, location, city, startDate, endDate, totalUnits, bookedUnits, status, rating, imageUrl) VALUES
    (${INVESTOR_ID}, 'معرض الرياض الدولي للتجارة', 'Riyadh International Trade Expo', 'أكبر معرض تجاري في المملكة يجمع أكثر من 500 علامة تجارية محلية ودولية', 'مركز الرياض الدولي للمؤتمرات والمعارض', 'الرياض', '2026-04-15 09:00:00', '2026-04-20 22:00:00', 120, 87, 'active', 4.8, NULL),
    (${INVESTOR_ID}, 'بوليفارد وورلد - موسم الرياض', 'Boulevard World - Riyadh Season', 'وجهة ترفيهية عالمية تضم مناطق مستوحاة من 12 دولة حول العالم', 'بوليفارد وورلد', 'الرياض', '2026-03-01 16:00:00', '2026-06-30 02:00:00', 250, 198, 'active', 4.9, NULL),
    (${INVESTOR_ID}, 'معرض جدة للأغذية والمشروبات', 'Jeddah Food & Beverage Expo', 'معرض متخصص في قطاع الأغذية والمشروبات يستقطب أفضل العلامات التجارية', 'مركز جدة للمعارض', 'جدة', '2026-05-10 10:00:00', '2026-05-15 22:00:00', 80, 45, 'upcoming', 4.5, NULL),
    (${INVESTOR_ID}, 'معرض الدمام للتقنية', 'Dammam Tech Exhibition', 'معرض التقنية والابتكار في المنطقة الشرقية', 'مركز الظهران للمعارض', 'الدمام', '2026-06-01 09:00:00', '2026-06-05 21:00:00', 60, 12, 'upcoming', 0.0, NULL),
    (${INVESTOR_ID}, 'معرض المدينة للحرف اليدوية', 'Madinah Handicrafts Fair', 'معرض متخصص في الحرف اليدوية والتراث السعودي', 'مركز المدينة للمعارض', 'المدينة المنورة', '2025-12-01 10:00:00', '2025-12-07 22:00:00', 40, 40, 'completed', 4.7, NULL),
    (${INVESTOR_ID}, 'معرض الطائف الصيفي', 'Taif Summer Expo', 'معرض صيفي سنوي يقام في مدينة الورد', 'منتزه الردف', 'الطائف', '2025-07-15 17:00:00', '2025-08-15 00:00:00', 50, 50, 'completed', 4.6, NULL)
  `);

  // ============================================
  // 2. EXHIBITION UNITS (وحدات المعارض)
  // ============================================
  console.log('🏪 Seeding exhibition units...');
  // Units for Exhibition 1 (Riyadh Trade Expo)
  const unitTypes = ['retail', 'food', 'service', 'premium'];
  const unitStatuses = ['available', 'booked', 'pending'];
  let unitInserts = [];
  for (let i = 1; i <= 30; i++) {
    const type = unitTypes[Math.floor(Math.random() * unitTypes.length)];
    const status = i <= 22 ? 'booked' : (i <= 25 ? 'pending' : 'available');
    const area = type === 'premium' ? 50 + Math.floor(Math.random() * 50) : 15 + Math.floor(Math.random() * 35);
    const price = type === 'premium' ? 80000 + Math.floor(Math.random() * 120000) : 15000 + Math.floor(Math.random() * 45000);
    const row = Math.floor((i - 1) / 6);
    const col = (i - 1) % 6;
    unitInserts.push(`(1, 'A-${String(i).padStart(3, '0')}', '${type}', ${area}, ${price}, '${status}', ${col * 2}, ${row * 2}, ${type === 'premium' ? 2 : 1}, ${type === 'premium' ? 2 : 1})`);
  }
  // Units for Exhibition 2 (Boulevard World)
  for (let i = 1; i <= 40; i++) {
    const type = unitTypes[Math.floor(Math.random() * unitTypes.length)];
    const status = i <= 33 ? 'booked' : (i <= 36 ? 'pending' : 'available');
    const area = 20 + Math.floor(Math.random() * 80);
    const price = 25000 + Math.floor(Math.random() * 175000);
    const row = Math.floor((i - 1) / 8);
    const col = (i - 1) % 8;
    unitInserts.push(`(2, 'BW-${String(i).padStart(3, '0')}', '${type}', ${area}, ${price}, '${status}', ${col * 2}, ${row * 2}, 1, 1)`);
  }
  await conn.execute(`INSERT INTO exhibition_units (exhibitionId, unitCode, unitType, area, price, status, positionX, positionY, width, height) VALUES ${unitInserts.join(',')}`);

  // ============================================
  // 3. BOOKING REQUESTS (طلبات الحجز)
  // ============================================
  console.log('📋 Seeding booking requests...');
  await conn.execute(`INSERT INTO booking_requests (exhibitionId, unitId, merchantName, merchantCompany, merchantPhone, merchantEmail, activityType, requestedAmount, status, notes, investorId) VALUES
    (1, 1, 'أحمد الغامدي', 'شركة الغامدي للتجارة', '0551234567', 'ahmed@alghamdi.sa', 'retail', 35000.00, 'approved', 'طلب حجز وحدة تجارية - تم الموافقة', ${INVESTOR_ID}),
    (1, 2, 'محمد العتيبي', 'مؤسسة العتيبي للأزياء', '0559876543', 'mohammed@otaibi.sa', 'retail', 28000.00, 'approved', 'حجز وحدة أزياء - تم التأكيد', ${INVESTOR_ID}),
    (1, 3, 'فهد القحطاني', 'مطاعم القحطاني', '0553456789', 'fahad@qahtan.sa', 'food', 42000.00, 'approved', 'حجز وحدة مطاعم - تم الموافقة', ${INVESTOR_ID}),
    (2, 31, 'سارة الدوسري', 'شركة سارة للعطور', '0557654321', 'sara@dosari.sa', 'premium', 120000.00, 'approved', 'حجز وحدة بريميوم في بوليفارد وورلد', ${INVESTOR_ID}),
    (2, 32, 'خالد الشمري', 'مجموعة الشمري التجارية', '0552345678', 'khalid@shamri.sa', 'retail', 55000.00, 'approved', 'حجز وحدة تجارية', ${INVESTOR_ID}),
    (1, 26, 'عبدالله المطيري', 'شركة المطيري للإلكترونيات', '0558765432', 'abdullah@mutairi.sa', 'service', 32000.00, 'pending', 'طلب حجز جديد - بانتظار المراجعة', ${INVESTOR_ID}),
    (1, 27, 'نورة الحربي', 'مؤسسة نورة للحلويات', '0554321098', 'noura@harbi.sa', 'food', 25000.00, 'pending', 'طلب حجز وحدة أغذية - جديد', ${INVESTOR_ID}),
    (3, NULL, 'ياسر الزهراني', 'مجموعة الزهراني الغذائية', '0556789012', 'yaser@zahrani.sa', 'food', 38000.00, 'pending', 'طلب حجز في معرض جدة للأغذية', ${INVESTOR_ID}),
    (1, 28, 'ريم السبيعي', 'شركة ريم للأثاث', '0550123456', 'reem@subaie.sa', 'retail', 30000.00, 'rejected', 'تم الرفض - عدم استيفاء الشروط', ${INVESTOR_ID}),
    (2, 37, 'تركي العنزي', 'مؤسسة تركي للترفيه', '0559012345', 'turki@anazi.sa', 'service', 45000.00, 'pending', 'طلب حجز وحدة ترفيهية', ${INVESTOR_ID})
  `);

  // ============================================
  // 4. CONTRACTS (العقود)
  // ============================================
  console.log('📄 Seeding contracts...');
  await conn.execute(`INSERT INTO contracts (contractNumber, exhibitionId, bookingId, investorId, merchantName, merchantCompany, unitCode, amount, startDate, endDate, status, signedAt) VALUES
    ('CNT-2026-001', 1, 1, ${INVESTOR_ID}, 'أحمد الغامدي', 'شركة الغامدي للتجارة', 'A-001', 35000.00, '2026-04-15 00:00:00', '2026-04-20 00:00:00', 'active', '2026-03-01 10:30:00'),
    ('CNT-2026-002', 1, 2, ${INVESTOR_ID}, 'محمد العتيبي', 'مؤسسة العتيبي للأزياء', 'A-002', 28000.00, '2026-04-15 00:00:00', '2026-04-20 00:00:00', 'active', '2026-03-02 14:15:00'),
    ('CNT-2026-003', 1, 3, ${INVESTOR_ID}, 'فهد القحطاني', 'مطاعم القحطاني', 'A-003', 42000.00, '2026-04-15 00:00:00', '2026-04-20 00:00:00', 'active', '2026-03-03 09:00:00'),
    ('CNT-2026-004', 2, 4, ${INVESTOR_ID}, 'سارة الدوسري', 'شركة سارة للعطور', 'BW-031', 120000.00, '2026-03-01 00:00:00', '2026-06-30 00:00:00', 'active', '2026-02-20 11:00:00'),
    ('CNT-2026-005', 2, 5, ${INVESTOR_ID}, 'خالد الشمري', 'مجموعة الشمري التجارية', 'BW-032', 55000.00, '2026-03-01 00:00:00', '2026-06-30 00:00:00', 'active', '2026-02-22 16:30:00'),
    ('CNT-2026-006', 3, NULL, ${INVESTOR_ID}, 'ياسر الزهراني', 'مجموعة الزهراني الغذائية', 'TBD', 38000.00, '2026-05-10 00:00:00', '2026-05-15 00:00:00', 'pending_signature', NULL),
    ('CNT-2025-010', 5, NULL, ${INVESTOR_ID}, 'عمر الشهري', 'مؤسسة الشهري للحرف', 'M-015', 18000.00, '2025-12-01 00:00:00', '2025-12-07 00:00:00', 'expired', '2025-11-15 10:00:00'),
    ('CNT-2025-011', 6, NULL, ${INVESTOR_ID}, 'هند الدوسري', 'شركة هند للورود', 'T-008', 22000.00, '2025-07-15 00:00:00', '2025-08-15 00:00:00', 'expired', '2025-07-01 09:00:00')
  `);

  // ============================================
  // 5. PAYMENTS (المدفوعات)
  // ============================================
  console.log('💰 Seeding payments...');
  await conn.execute(`INSERT INTO payments (contractId, exhibitionId, investorId, merchantName, merchantCompany, amount, paymentMethod, status, transactionRef, paidAt) VALUES
    (1, 1, ${INVESTOR_ID}, 'أحمد الغامدي', 'شركة الغامدي للتجارة', 35000.00, 'bank_transfer', 'received', 'TXN-2026-0001', '2026-03-05 10:30:00'),
    (2, 1, ${INVESTOR_ID}, 'محمد العتيبي', 'مؤسسة العتيبي للأزياء', 28000.00, 'mada', 'received', 'TXN-2026-0002', '2026-03-06 14:00:00'),
    (3, 1, ${INVESTOR_ID}, 'فهد القحطاني', 'مطاعم القحطاني', 42000.00, 'bank_transfer', 'received', 'TXN-2026-0003', '2026-03-07 11:15:00'),
    (4, 2, ${INVESTOR_ID}, 'سارة الدوسري', 'شركة سارة للعطور', 60000.00, 'bank_transfer', 'received', 'TXN-2026-0004', '2026-02-25 09:00:00'),
    (4, 2, ${INVESTOR_ID}, 'سارة الدوسري', 'شركة سارة للعطور', 60000.00, 'bank_transfer', 'pending', 'TXN-2026-0005', NULL),
    (5, 2, ${INVESTOR_ID}, 'خالد الشمري', 'مجموعة الشمري التجارية', 55000.00, 'credit_card', 'received', 'TXN-2026-0006', '2026-02-28 16:00:00'),
    (7, 5, ${INVESTOR_ID}, 'عمر الشهري', 'مؤسسة الشهري للحرف', 18000.00, 'cash', 'received', 'TXN-2025-0010', '2025-11-20 10:00:00'),
    (8, 6, ${INVESTOR_ID}, 'هند الدوسري', 'شركة هند للورود', 22000.00, 'mada', 'received', 'TXN-2025-0011', '2025-07-10 14:30:00'),
    (6, 3, ${INVESTOR_ID}, 'ياسر الزهراني', 'مجموعة الزهراني الغذائية', 38000.00, 'bank_transfer', 'pending', 'TXN-2026-0007', NULL)
  `);

  // ============================================
  // 6. INVESTMENT OPPORTUNITIES (فرص استثمارية)
  // ============================================
  console.log('🎯 Seeding investment opportunities...');
  await conn.execute(`INSERT INTO investment_opportunities (title, titleEn, description, category, eventName, location, city, requiredInvestment, expectedRevenue, projectedROI, duration, riskLevel, opportunityScore, status, operatorName, operatorProfile, investmentStructure, businessModel, visitorTraffic, imageUrl) VALUES
    ('منطقة المأكولات العالمية - بوليفارد وورلد', 'Global Food Court - Boulevard World', 'فرصة استثمارية لتشغيل منطقة المأكولات العالمية في بوليفارد وورلد تضم 15 مطعماً من مختلف المطابخ العالمية', 'food_beverage', 'موسم الرياض 2026', 'بوليفارد وورلد', 'الرياض', 2500000.00, 4200000.00, 68.00, '4 أشهر', 'low', 95, 'open', 'مجموعة ماهام للضيافة', 'خبرة 10 سنوات في إدارة المطاعم والفعاليات', 'شراكة 60/40 - المستثمر/المشغل', 'إيرادات مباشرة من المبيعات + نسبة من الأرباح', 50000, NULL),
    ('جناح العلامات الفاخرة - معرض الرياض', 'Luxury Brands Pavilion - Riyadh Expo', 'تشغيل جناح العلامات التجارية الفاخرة في معرض الرياض الدولي - 20 وحدة بريميوم', 'retail', 'معرض الرياض الدولي للتجارة', 'مركز الرياض الدولي', 'الرياض', 1800000.00, 2900000.00, 61.00, '6 أيام', 'medium', 88, 'open', 'شركة الرياض للتجزئة', 'متخصصون في إدارة مساحات التجزئة الفاخرة', 'استثمار مباشر 100%', 'إيرادات الإيجار + نسبة من المبيعات', 35000, NULL),
    ('منطقة الترفيه التفاعلي - بوليفارد وورلد', 'Interactive Entertainment Zone - Boulevard World', 'فرصة لإنشاء وتشغيل منطقة ترفيه تفاعلية بتقنيات VR و AR في قلب بوليفارد وورلد', 'event_partnership', 'موسم الرياض 2026', 'بوليفارد وورلد', 'الرياض', 3500000.00, 6100000.00, 74.00, '4 أشهر', 'medium', 92, 'open', 'شركة فيوتشر تك', 'رواد في تقنيات الواقع الافتراضي والمعزز', 'شراكة استراتيجية 50/50', 'تذاكر دخول + تجارب مدفوعة', 80000, NULL),
    ('سوق الحرف السعودية - معرض المدينة', 'Saudi Crafts Market - Madinah Fair', 'تشغيل سوق متخصص في الحرف اليدوية السعودية الأصيلة مع ورش عمل تفاعلية', 'brand_experience', 'معرض المدينة للحرف اليدوية', 'مركز المدينة للمعارض', 'المدينة المنورة', 800000.00, 1200000.00, 50.00, '7 أيام', 'low', 78, 'open', 'جمعية الحرف السعودية', 'جمعية غير ربحية تدعم الحرفيين السعوديين', 'رعاية + استثمار مباشر', 'مبيعات مباشرة + رسوم ورش العمل', 15000, NULL),
    ('منصة التجارة الإلكترونية للمعارض', 'Expo E-Commerce Platform', 'فرصة تقنية لبناء منصة تجارة إلكترونية متكاملة تخدم جميع معارض ماهام', 'technology', NULL, 'عن بعد', 'الرياض', 5000000.00, 9500000.00, 90.00, '12 شهر', 'high', 85, 'open', 'ماهام تك', 'الذراع التقني لمجموعة ماهام', 'استثمار رأسمالي + حصة ملكية', 'اشتراكات SaaS + عمولات معاملات', 0, NULL),
    ('Pop-Up Store Zone - جدة', 'Pop-Up Store Zone - Jeddah', 'منطقة متاجر مؤقتة للعلامات الناشئة في معرض جدة للأغذية والمشروبات', 'popup', 'معرض جدة للأغذية والمشروبات', 'مركز جدة للمعارض', 'جدة', 600000.00, 950000.00, 58.00, '5 أيام', 'low', 72, 'open', 'شركة جدة للفعاليات', 'متخصصون في تنظيم الفعاليات في جدة', 'استثمار مباشر 100%', 'إيجارات يومية + نسبة مبيعات', 20000, NULL),
    ('مركز الابتكار التقني - الدمام', 'Tech Innovation Hub - Dammam', 'إنشاء مركز ابتكار تقني داخل معرض الدمام للتقنية يضم شركات ناشئة ومختبرات', 'technology', 'معرض الدمام للتقنية', 'مركز الظهران للمعارض', 'الدمام', 1200000.00, 1800000.00, 50.00, '5 أيام', 'medium', 70, 'reserved', 'شركة الابتكار السعودية', 'حاضنة أعمال تقنية معتمدة', 'شراكة 70/30', 'رسوم مشاركة + رعايات', 10000, NULL)
  `);

  // ============================================
  // 7. ACTIVE INVESTMENTS (استثمارات نشطة)
  // ============================================
  console.log('📊 Seeding active investments...');
  await conn.execute(`INSERT INTO active_investments (investorId, opportunityId, title, investmentAmount, ownershipPercentage, operatorName, currentRevenue, profitDistributed, status, startDate, endDate) VALUES
    (${INVESTOR_ID}, NULL, 'بوليفارد وورلد - المنطقة التجارية الرئيسية', 3500000.00, 35.00, 'مجموعة ماهام للضيافة', 5200000.00, 1820000.00, 'active', '2026-01-15 00:00:00', '2026-06-30 00:00:00'),
    (${INVESTOR_ID}, NULL, 'معرض الرياض الدولي - جناح الإلكترونيات', 1200000.00, 60.00, 'شركة الرياض للتجزئة', 1850000.00, 740000.00, 'active', '2026-03-01 00:00:00', '2026-04-20 00:00:00'),
    (${INVESTOR_ID}, NULL, 'موسم جدة - منطقة الأغذية', 800000.00, 25.00, 'شركة جدة للفعاليات', 420000.00, 105000.00, 'active', '2026-02-01 00:00:00', '2026-05-31 00:00:00'),
    (${INVESTOR_ID}, NULL, 'معرض المدينة - سوق التراث', 500000.00, 100.00, 'جمعية الحرف السعودية', 680000.00, 680000.00, 'completed', '2025-12-01 00:00:00', '2025-12-07 00:00:00'),
    (${INVESTOR_ID}, NULL, 'معرض الطائف الصيفي - المنطقة الترفيهية', 750000.00, 40.00, 'شركة الطائف للترفيه', 1100000.00, 440000.00, 'completed', '2025-07-15 00:00:00', '2025-08-15 00:00:00')
  `);

  // ============================================
  // 8. INVESTOR PROFILE (ملف المستثمر)
  // ============================================
  console.log('👤 Seeding investor profile...');
  await conn.execute(`INSERT INTO investor_profiles (userId, investorType, companyName, preferredSectors, investmentCapacity, totalInvested, verificationStatus, bio, phone, location) VALUES
    (${INVESTOR_ID}, 'company', 'مجموعة ماهام', 'exhibitions_events,food_beverage,retail_brands,technology', 50000000.00, 6750000.00, 'verified', 'مجموعة ماهام - رواد في تنظيم المعارض والفعاليات في المملكة العربية السعودية. نستثمر في قطاعات التجزئة والأغذية والتقنية ضمن أكبر الفعاليات السعودية.', '0500000000', 'الرياض، المملكة العربية السعودية')
  `);

  // ============================================
  // 9. NOTIFICATIONS (إشعارات)
  // ============================================
  console.log('🔔 Seeding notifications...');
  await conn.execute(`INSERT INTO notifications (userId, title, message, type, isRead, relatedId) VALUES
    (${INVESTOR_ID}, 'طلب حجز جديد', 'تقدم عبدالله المطيري بطلب حجز وحدة A-026 في معرض الرياض الدولي', 'booking', 0, 6),
    (${INVESTOR_ID}, 'طلب حجز جديد', 'تقدمت نورة الحربي بطلب حجز وحدة أغذية في معرض الرياض', 'booking', 0, 7),
    (${INVESTOR_ID}, 'طلب حجز جديد', 'تقدم ياسر الزهراني بطلب حجز في معرض جدة للأغذية', 'booking', 0, 8),
    (${INVESTOR_ID}, 'عقد بانتظار التوقيع', 'عقد CNT-2026-006 مع ياسر الزهراني بانتظار توقيعك', 'contract', 0, 6),
    (${INVESTOR_ID}, 'دفعة مستلمة', 'تم استلام دفعة بقيمة 55,000 ر.س من خالد الشمري', 'payment', 1, 6),
    (${INVESTOR_ID}, 'فرصة استثمارية جديدة', 'فرصة جديدة: منطقة المأكولات العالمية في بوليفارد وورلد - عائد متوقع 68%', 'opportunity', 0, 1),
    (${INVESTOR_ID}, 'فرصة استثمارية جديدة', 'فرصة جديدة: منطقة الترفيه التفاعلي - عائد متوقع 74%', 'opportunity', 0, 3),
    (${INVESTOR_ID}, 'تحديث المحفظة', 'ارتفعت إيرادات استثمارك في بوليفارد وورلد بنسبة 12% هذا الشهر', 'investment', 1, 1),
    (${INVESTOR_ID}, 'تحديث النظام', 'تم تحديث بوابة المستثمر بميزات جديدة: سوق الفرص الاستثمارية ومركز الأداء المالي', 'system', 1, NULL),
    (${INVESTOR_ID}, 'طلب حجز مرفوض', 'تم رفض طلب حجز ريم السبيعي - عدم استيفاء الشروط', 'booking', 1, 9),
    (${INVESTOR_ID}, 'دفعة معلقة', 'دفعة بقيمة 60,000 ر.س من سارة الدوسري بانتظار التحويل', 'payment', 0, 5),
    (${INVESTOR_ID}, 'طلب حجز جديد', 'تقدم تركي العنزي بطلب حجز وحدة ترفيهية في بوليفارد وورلد', 'booking', 0, 10)
  `);

  // ============================================
  // 10. ACTIVITY LOG (سجل النشاط)
  // ============================================
  console.log('📝 Seeding activity log...');
  await conn.execute(`INSERT INTO activity_log (userId, action, details, entityType, entityId) VALUES
    (${INVESTOR_ID}, 'تسجيل دخول', 'تم تسجيل الدخول إلى بوابة المستثمر', NULL, NULL),
    (${INVESTOR_ID}, 'موافقة على حجز', 'تمت الموافقة على طلب حجز أحمد الغامدي', 'booking', 1),
    (${INVESTOR_ID}, 'موافقة على حجز', 'تمت الموافقة على طلب حجز محمد العتيبي', 'booking', 2),
    (${INVESTOR_ID}, 'توقيع عقد', 'تم توقيع عقد CNT-2026-001 مع أحمد الغامدي', 'contract', 1),
    (${INVESTOR_ID}, 'توقيع عقد', 'تم توقيع عقد CNT-2026-004 مع سارة الدوسري', 'contract', 4),
    (${INVESTOR_ID}, 'استلام دفعة', 'تم استلام دفعة 35,000 ر.س من أحمد الغامدي', 'payment', 1),
    (${INVESTOR_ID}, 'استلام دفعة', 'تم استلام دفعة 120,000 ر.س من سارة الدوسري (القسط الأول)', 'payment', 4),
    (${INVESTOR_ID}, 'إضافة معرض', 'تم إضافة معرض جدة للأغذية والمشروبات', 'exhibition', 3),
    (${INVESTOR_ID}, 'رفض حجز', 'تم رفض طلب حجز ريم السبيعي', 'booking', 9),
    (${INVESTOR_ID}, 'تحديث الملف الشخصي', 'تم تحديث بيانات الملف الشخصي للمستثمر', 'profile', 1)
  `);

  // ============================================
  // 11. INVESTOR DOCUMENTS (مستندات المستثمر)
  // ============================================
  console.log('📁 Seeding investor documents...');
  await conn.execute(`INSERT INTO investor_documents (investorId, title, documentType, fileUrl, fileSize, relatedEntityType, relatedEntityId) VALUES
    (${INVESTOR_ID}, 'عقد معرض الرياض الدولي - أحمد الغامدي', 'contract', NULL, 245000, 'contract', 1),
    (${INVESTOR_ID}, 'عقد بوليفارد وورلد - سارة الدوسري', 'contract', NULL, 312000, 'contract', 4),
    (${INVESTOR_ID}, 'إيصال دفعة - أحمد الغامدي', 'payment_receipt', NULL, 85000, 'payment', 1),
    (${INVESTOR_ID}, 'إيصال دفعة - سارة الدوسري', 'payment_receipt', NULL, 92000, 'payment', 4),
    (${INVESTOR_ID}, 'تقرير أداء بوليفارد وورلد - مارس 2026', 'report', NULL, 1500000, 'investment', 1),
    (${INVESTOR_ID}, 'تقرير أداء معرض الرياض - مارس 2026', 'report', NULL, 980000, 'investment', 2),
    (${INVESTOR_ID}, 'شهادة تسجيل المستثمر', 'certificate', NULL, 150000, NULL, NULL),
    (${INVESTOR_ID}, 'القوائم المالية - الربع الأول 2026', 'financial_statement', NULL, 2200000, NULL, NULL),
    (${INVESTOR_ID}, 'اتفاقية شراكة - مجموعة ماهام للضيافة', 'agreement', NULL, 420000, 'investment', 1),
    (${INVESTOR_ID}, 'عقد معرض الرياض - محمد العتيبي', 'contract', NULL, 230000, 'contract', 2)
  `);

  // ============================================
  // 12. MESSAGES (رسائل)
  // ============================================
  console.log('💬 Seeding messages...');
  await conn.execute(`INSERT INTO messages (senderId, receiverId, subject, content, isRead, senderType) VALUES
    (${INVESTOR_ID}, 2, 'استفسار عن موعد افتتاح المعرض', 'السلام عليكم، أرجو تأكيد موعد افتتاح معرض الرياض الدولي للتجارة. هل سيكون في 15 أبريل كما هو مخطط؟', 1, 'investor'),
    (2, ${INVESTOR_ID}, 'رد: استفسار عن موعد افتتاح المعرض', 'وعليكم السلام، نعم المعرض سيفتتح في 15 أبريل 2026 كما هو مخطط. جميع الاستعدادات تسير بشكل ممتاز.', 1, 'operator'),
    (${INVESTOR_ID}, 2, 'طلب تقرير أداء شهري', 'أرجو إرسال تقرير الأداء الشهري لاستثمارات بوليفارد وورلد للشهر الماضي.', 1, 'investor'),
    (2, ${INVESTOR_ID}, 'رد: طلب تقرير أداء شهري', 'تم إرفاق التقرير في خزنة المستندات. الإيرادات ارتفعت بنسبة 12% مقارنة بالشهر السابق.', 0, 'operator'),
    (${INVESTOR_ID}, 2, 'اقتراح توسيع المنطقة التجارية', 'أقترح توسيع المنطقة التجارية في بوليفارد وورلد بإضافة 10 وحدات جديدة نظراً للطلب المرتفع.', 0, 'investor')
  `);

  // ============================================
  // 13. INVESTOR LEADS (عملاء محتملين)
  // ============================================
  console.log('🎯 Seeding investor leads...');
  await conn.execute(`INSERT INTO investor_leads (phone, fullName, investmentInterest, region, userId, status, source, isRegistered, lastLoginAt) VALUES
    ('0500000000', 'نور كرم', 'exhibitions_events', 'الرياض', ${INVESTOR_ID}, 'converted', 'investor_portal', 1, NOW()),
    ('0551112222', 'سلطان الدوسري', 'real_estate', 'الرياض', NULL, 'qualified', 'investor_portal', 1, '2026-03-15 10:00:00'),
    ('0553334444', 'منال الحربي', 'food_beverage', 'جدة', NULL, 'contacted', 'investor_portal', 1, '2026-03-10 14:30:00'),
    ('0555556666', 'فيصل العنزي', 'technology', 'الدمام', NULL, 'new', 'investor_portal', 0, NULL),
    ('0557778888', 'ريم القحطاني', 'entertainment', 'الرياض', NULL, 'new', 'investor_portal', 0, NULL)
  `);

  console.log('✅ Seed data completed successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log('  - 6 exhibitions');
  console.log('  - 70 exhibition units');
  console.log('  - 10 booking requests');
  console.log('  - 8 contracts');
  console.log('  - 9 payments');
  console.log('  - 7 investment opportunities');
  console.log('  - 5 active investments');
  console.log('  - 1 investor profile');
  console.log('  - 12 notifications');
  console.log('  - 10 activity log entries');
  console.log('  - 10 investor documents');
  console.log('  - 5 messages');
  console.log('  - 5 investor leads');

  await conn.end();
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
