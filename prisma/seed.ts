import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@congty.com" },
    update: {},
    create: {
      email: "admin@congty.com",
      name: "Founder",
      passwordHash,
      role: "ADMIN",
    },
  });

  const sales1 = await prisma.user.upsert({
    where: { email: "lan.sales@congty.com" },
    update: {},
    create: {
      email: "lan.sales@congty.com",
      name: "Nguyễn Thị Lan",
      passwordHash,
      role: "SALES",
    },
  });

  const sales2 = await prisma.user.upsert({
    where: { email: "minh.sales@congty.com" },
    update: {},
    create: {
      email: "minh.sales@congty.com",
      name: "Trần Văn Minh",
      passwordHash,
      role: "SALES",
    },
  });

  const ketoan = await prisma.user.upsert({
    where: { email: "hoa.ketoan@congty.com" },
    update: {},
    create: {
      email: "hoa.ketoan@congty.com",
      name: "Phạm Thị Hoa",
      passwordHash,
      role: "KETOAN",
    },
  });

  const kho = await prisma.user.upsert({
    where: { email: "tuan.kho@congty.com" },
    update: {},
    create: {
      email: "tuan.kho@congty.com",
      name: "Lê Văn Tuấn",
      passwordHash,
      role: "KHO",
    },
  });

  // Customers
  const customerNames = [
    "Công ty TNHH Bao Bì An Phát",
    "Cửa hàng Giấy Minh Tâm",
    "Xưởng In Đại Thành",
    "Công ty CP Thương Mại Việt Hưng",
    "Cửa hàng Văn Phòng Phẩm Hồng Ngọc",
    "Công ty TNHH Sản Xuất Giấy Toàn Quốc",
  ];

  const customers = [];
  for (let i = 0; i < customerNames.length; i++) {
    const c = await prisma.customer.create({
      data: {
        name: customerNames[i],
        phone: `09${(10000000 + i * 137).toString().slice(0, 8)}`,
        source: i % 2 === 0 ? "facebook" : "gioi_thieu",
        status: i % 3 === 0 ? "dang_cham_soc" : "da_mua",
        assignedSalesId: i % 2 === 0 ? sales1.id : sales2.id,
        createdAt: daysAgo(30 - i * 3),
      },
    });
    customers.push(c);
  }

  for (const c of customers) {
    await prisma.careLog.create({
      data: {
        customerId: c.id,
        salesId: c.assignedSalesId!,
        note: "Gọi tư vấn nhu cầu bao bì giấy, khách quan tâm báo giá số lượng lớn.",
        result: "hen_goi_lai",
        date: daysAgo(Math.floor(Math.random() * 10)),
      },
    });
  }

  // Orders
  for (let i = 0; i < 12; i++) {
    const customer = customers[i % customers.length];
    const sales = customer.assignedSalesId === sales1.id ? sales1 : sales2;
    await prisma.order.create({
      data: {
        customerId: customer.id,
        salesId: sales.id,
        orderDate: daysAgo(i),
        totalAmount: 2_000_000 + i * 350_000,
        status: i % 4 === 0 ? "pending" : "completed",
        items: {
          create: [
            {
              productName: "Thùng carton 3 lớp",
              quantity: 100 + i * 5,
              unitPrice: 12000,
            },
          ],
        },
      },
    });
  }

  // Inventory
  const items = [
    { sku: "TB-3L-01", name: "Thùng carton 3 lớp", unit: "thùng", qty: 850 },
    { sku: "TB-5L-01", name: "Thùng carton 5 lớp", unit: "thùng", qty: 6 },
    { sku: "GIAY-KRAFT-70", name: "Giấy Kraft 70gsm", unit: "cuộn", qty: 42 },
    { sku: "BANG-DINH-01", name: "Băng dính đóng thùng", unit: "cuộn", qty: 9 },
  ];

  for (const it of items) {
    const inv = await prisma.inventoryItem.upsert({
      where: { sku: it.sku },
      update: { quantityOnHand: it.qty },
      create: {
        sku: it.sku,
        name: it.name,
        unit: it.unit,
        quantityOnHand: it.qty,
      },
    });
    await prisma.inventoryTransaction.create({
      data: {
        itemId: inv.id,
        type: "IN",
        quantity: it.qty,
        note: "Nhập kho đầu kỳ",
        date: daysAgo(20),
        createdById: kho.id,
      },
    });
  }

  // Finance
  for (let i = 0; i < 15; i++) {
    await prisma.financeTransaction.create({
      data: {
        type: i % 3 === 0 ? "EXPENSE" : "INCOME",
        category: i % 3 === 0 ? "Chi phí vận hành" : "Doanh thu bán hàng",
        amount: i % 3 === 0 ? 1_200_000 + i * 50_000 : 3_500_000 + i * 200_000,
        note: i % 3 === 0 ? "Thanh toán nguyên vật liệu" : "Thu tiền đơn hàng",
        date: daysAgo(i),
        createdById: ketoan.id,
      },
    });
  }

  // Revenue entries (30 days)
  for (let i = 0; i < 30; i++) {
    await prisma.revenueEntry.create({
      data: {
        date: daysAgo(i),
        amount: 2_000_000 + Math.round(Math.random() * 4_000_000),
        source: i % 2 === 0 ? "ban_hang_truc_tiep" : "online",
      },
    });
  }

  // Ad campaigns
  for (let i = 0; i < 15; i++) {
    await prisma.adCampaign.create({
      data: {
        name: `Chiến dịch bao bì giấy #${(i % 3) + 1}`,
        platform: "google_ads",
        date: daysAgo(i),
        spend: 300_000 + i * 20_000,
        clicks: 40 + i * 3,
        impressions: 2000 + i * 100,
        conversions: 2 + (i % 5),
      },
    });
  }

  // Social metrics
  for (let i = 0; i < 15; i++) {
    await prisma.socialMetric.create({
      data: {
        platform: "facebook",
        date: daysAgo(i),
        views: 500 + i * 40,
        reach: 1200 + i * 60,
        engagement: 30 + i * 4,
      },
    });
  }

  // Checklist
  const checklistTitles = [
    "Gửi báo cáo doanh thu 7h sáng",
    "Kiểm tra tồn kho thùng carton 5 lớp",
    "Gọi lại khách hàng Hồng Ngọc",
    "Đối soát thu chi tuần",
    "Duyệt ngân sách Google Ads tuần tới",
  ];
  for (let i = 0; i < checklistTitles.length; i++) {
    await prisma.checklistItem.create({
      data: {
        title: checklistTitles[i],
        date: daysAgo(-i),
        done: i === checklistTitles.length - 1,
        assignedToId: [admin.id, sales1.id, sales2.id, ketoan.id, kho.id][i],
      },
    });
  }

  // Email logs
  const emails = [
    { subject: "Báo giá thùng carton số lượng lớn", sender: "khachhang1@gmail.com", category: "kinh_doanh" },
    { subject: "Xác nhận đơn hàng #1042", sender: "sales@baobigiaytoanquoc.com", category: "don_hang" },
    { subject: "Đề xuất hợp tác nguyên liệu giấy Kraft", sender: "nhacungcap@giaykraft.vn", category: "nha_cung_cap" },
  ];
  for (let i = 0; i < emails.length; i++) {
    await prisma.emailLog.create({
      data: {
        subject: emails[i].subject,
        sender: emails[i].sender,
        category: emails[i].category,
        receivedAt: daysAgo(i),
        summary: "Nội dung tóm tắt tự động sẽ hiển thị khi kết nối Gmail.",
      },
    });
  }

  console.log("Seed hoàn tất.");
  console.log("Tài khoản đăng nhập mẫu (mật khẩu: password123):");
  console.log("- admin@congty.com (ADMIN)");
  console.log("- lan.sales@congty.com (SALES)");
  console.log("- minh.sales@congty.com (SALES)");
  console.log("- hoa.ketoan@congty.com (KETOAN)");
  console.log("- tuan.kho@congty.com (KHO)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
