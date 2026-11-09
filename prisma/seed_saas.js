const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Wox WhatsApp SaaS default plans and super admin...');

  // 1. Create Default Plans
  const plans = [
    {
      name: 'Starter',
      nameAr: 'باقة البداية',
      description: 'مثالية للمتاجر الناشئة وأصحاب الأعمال الفردية لبدء أتمتة وتواصل الواتساب',
      priceSAR: 99,
      priceEGP: 750,
      priceUSD: 29,
      instanceLimit: 1,
      messageLimit: 2000,
      aiBotsLimit: 1,
      hasWebhooks: true,
      hasStoreIntegrations: true,
    },
    {
      name: 'Growth',
      nameAr: 'باقة النمو (الأكثر طلباً)',
      description: 'للشركات والمتاجر المتوسطة التي تبحث عن أتمتة مبيعات ذكية وربط متكامل',
      priceSAR: 249,
      priceEGP: 1900,
      priceUSD: 69,
      instanceLimit: 3,
      messageLimit: 15000,
      aiBotsLimit: 5,
      hasWebhooks: true,
      hasStoreIntegrations: true,
    },
    {
      name: 'Enterprise',
      nameAr: 'باقة الشركات الكبرى',
      description: 'حلول اتصالات وأتمتة مخصصة مع رسائل غير محدودة ودعم فني على مدار الساعة',
      priceSAR: 599,
      priceEGP: 4800,
      priceUSD: 160,
      instanceLimit: 10,
      messageLimit: 100000,
      aiBotsLimit: 20,
      hasWebhooks: true,
      hasStoreIntegrations: true,
    },
  ];

  for (const plan of plans) {
    const existing = await prisma.plan.findFirst({ where: { name: plan.name } });
    if (!existing) {
      await prisma.plan.create({ data: plan });
      console.log(`Created plan: ${plan.nameAr}`);
    }
  }

  // 2. Create Default Ox Tech Super Admin Tenant & User
  let adminTenant = await prisma.tenant.findFirst({ where: { name: 'Ox Tech Admin' } });
  if (!adminTenant) {
    adminTenant = await prisma.tenant.create({
      data: {
        name: 'Ox Tech Admin',
        country: 'SA',
        currency: 'SAR',
      },
    });
  }

  const existingAdmin = await prisma.user.findUnique({ where: { email: 'admin@oxtech.com' } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: 'Ox Tech Super Admin',
        email: 'admin@oxtech.com',
        password: 'Admin@Wox2025SecurePassword!',
        phone: '+966500000000',
        role: 'SUPER_ADMIN',
        tenantId: adminTenant.id,
      },
    });
    console.log('Created Super Admin: admin@oxtech.com');
  }

  // 3. Create Sample Demo Virtual Numbers
  const demoNumbers = [
    { number: '+966581234567', country: 'SA', priceMonthly: 49 },
    { number: '+966591234568', country: 'SA', priceMonthly: 49 },
    { number: '+201012345678', country: 'EG', priceMonthly: 25 },
    { number: '+201112345679', country: 'EG', priceMonthly: 25 },
    { number: '+14155552671', country: 'US', priceMonthly: 15 },
  ];

  for (const num of demoNumbers) {
    const exists = await prisma.virtualNumber.findUnique({ where: { number: num.number } });
    if (!exists) {
      await prisma.virtualNumber.create({ data: num });
      console.log(`Added available virtual number: ${num.number} (${num.country})`);
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
