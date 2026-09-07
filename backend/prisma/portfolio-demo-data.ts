import { OrderStatus, PoolStatus, PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const connectionPool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(connectionPool);
const prisma = new PrismaClient({ adapter });

type PriceTierInput = {
  maxVolume: number | null;
  minVolume: number;
  pricePerKg: number;
};

async function ensureProduct(
  supplierId: string,
  name: string,
  description: string,
  tiers: PriceTierInput[],
) {
  let product = await prisma.product.findFirst({
    where: { name, supplierId },
    include: { priceTiers: true },
  });

  if (!product) {
    product = await prisma.product.create({
      data: { description, name, supplierId },
      include: { priceTiers: true },
    });
  }

  if (product.priceTiers.length === 0) {
    await prisma.priceTier.createMany({
      data: tiers.map((tier) => ({ ...tier, productId: product.id })),
    });
  }

  return product;
}

async function ensurePool(
  koperasiId: string,
  productId: string,
  name: string,
  quantity: number,
  pricePerKg: number,
  deadlineDays: number,
) {
  let collectivePool = await prisma.collectivePool.findFirst({
    where: { name },
  });

  if (!collectivePool) {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + deadlineDays);
    collectivePool = await prisma.collectivePool.create({
      data: {
        deadline,
        name,
        productId,
        status: PoolStatus.ACTIVE,
      },
    });
  }

  const existingOrder = await prisma.order.findFirst({
    where: { collectivePoolId: collectivePool.id, koperasiId },
  });

  if (!existingOrder) {
    await prisma.order.create({
      data: {
        collectivePoolId: collectivePool.id,
        koperasiId,
        status: OrderStatus.PENDING,
        totalPrice: quantity * pricePerKg,
        orderItems: {
          create: {
            priceAtPurchase: pricePerKg,
            productId,
            quantity,
          },
        },
      },
    });
  }

  return collectivePool;
}

async function ensureAuditLog(
  demoKey: string,
  action: string,
  details: Record<string, unknown>,
  userId: string,
  daysAgo: number,
) {
  const serializedDetails = JSON.stringify({
    portfolioDemo: true,
    demoKey,
    ...details,
  });
  const existing = await prisma.auditLog.findFirst({
    where: { details: { contains: `"demoKey":"${demoKey}"` } },
  });

  if (existing) {
    await prisma.auditLog.update({
      where: { id: existing.id },
      data: { action, details: serializedDetails, userId },
    });
    return;
  }

  const createdAt = new Date();
  createdAt.setDate(createdAt.getDate() - daysAgo);

  await prisma.auditLog.create({
    data: {
      action,
      createdAt,
      details: serializedDetails,
      userId,
    },
  });
}

async function main() {
  const koperasiUser =
    (await prisma.user.findFirst({
      where: { koperasiId: { not: null }, role: Role.ADMIN_KOPERASI },
      include: { koperasi: true },
      orderBy: { createdAt: 'asc' },
    })) ||
    (await prisma.user.findFirst({
      where: { koperasiId: { not: null }, role: Role.ANGGOTA },
      include: { koperasi: true },
      orderBy: { createdAt: 'asc' },
    }));

  const supplierUser = await prisma.user.findFirst({
    where: { role: Role.SUPPLIER, supplierId: { not: null } },
    include: { supplier: true },
    orderBy: { createdAt: 'asc' },
  });

  if (!koperasiUser?.koperasiId || !koperasiUser.koperasi) {
    throw new Error('Akun Koperasi demo belum tersedia.');
  }
  if (!supplierUser?.supplierId || !supplierUser.supplier) {
    throw new Error('Akun Supplier demo belum tersedia.');
  }

  const npk = await ensureProduct(
    supplierUser.supplierId,
    'Pupuk NPK Phonska',
    'Pupuk NPK untuk kebutuhan musim tanam padi dan palawija.',
    [
      { minVolume: 0, maxVolume: 5000, pricePerKg: 10000 },
      { minVolume: 5000, maxVolume: 10000, pricePerKg: 9200 },
      { minVolume: 10000, maxVolume: null, pricePerKg: 8500 },
    ],
  );
  const urea = await ensureProduct(
    supplierUser.supplierId,
    'Pupuk Urea Granul',
    'Pupuk nitrogen granul untuk mendukung pertumbuhan vegetatif tanaman.',
    [
      { minVolume: 0, maxVolume: 5000, pricePerKg: 9000 },
      { minVolume: 5000, maxVolume: 10000, pricePerKg: 8200 },
      { minVolume: 10000, maxVolume: null, pricePerKg: 7500 },
    ],
  );
  const sp36 = await ensureProduct(
    supplierUser.supplierId,
    'Pupuk SP-36',
    'Pupuk fosfat untuk pertumbuhan akar dan pembentukan bunga.',
    [
      { minVolume: 0, maxVolume: 5000, pricePerKg: 8800 },
      { minVolume: 5000, maxVolume: 10000, pricePerKg: 8000 },
      { minVolume: 10000, maxVolume: null, pricePerKg: 7300 },
    ],
  );

  const npkPool = await ensurePool(
    koperasiUser.koperasiId,
    npk.id,
    'Pool NPK Phonska Jember Raya',
    6500,
    9200,
    8,
  );
  const ureaPool = await ensurePool(
    koperasiUser.koperasiId,
    urea.id,
    'Pool Urea Musim Tanam Bersama',
    4200,
    9000,
    12,
  );
  await ensurePool(
    koperasiUser.koperasiId,
    sp36.id,
    'Pool SP-36 Koperasi Jawa Timur',
    7800,
    8000,
    15,
  );

  await ensureAuditLog(
    'manual-npk',
    'MANUAL_TRANSACTION',
    {
      jenisPupuk: 'Pupuk NPK Phonska',
      quantity: 2500,
      supplierName: supplierUser.supplier.name,
      totalPrice: 23000000,
    },
    koperasiUser.id,
    0,
  );
  await ensureAuditLog(
    'manual-urea',
    'MANUAL_TRANSACTION',
    {
      jenisPupuk: 'Pupuk Urea Granul',
      quantity: 1800,
      supplierName: supplierUser.supplier.name,
      totalPrice: 16200000,
    },
    koperasiUser.id,
    1,
  );
  await ensureAuditLog(
    'distribution-npk',
    'OUTGOING_DISTRIBUTION',
    {
      buyerName: 'Kelompok Tani Makmur',
      jenisPupuk: 'Pupuk NPK Phonska',
      pricePerKg: 11200,
      quantity: 750,
      totalPrice: 8400000,
    },
    koperasiUser.id,
    2,
  );
  await ensureAuditLog(
    'join-npk',
    'JOIN_POOL',
    {
      activePricePerKg: 9200,
      cooperativeName: koperasiUser.koperasi.name,
      poolId: npkPool.id,
      productName: npk.name,
      totalVolumeKg: 6500,
    },
    koperasiUser.id,
    0,
  );
  await ensureAuditLog(
    'join-urea',
    'JOIN_POOL',
    {
      activePricePerKg: 9000,
      cooperativeName: koperasiUser.koperasi.name,
      poolId: ureaPool.id,
      productName: urea.name,
      totalVolumeKg: 4200,
    },
    koperasiUser.id,
    1,
  );

  console.log(
    `Portfolio demo data ready for ${koperasiUser.koperasi.name} and ${supplierUser.supplier.name}.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await connectionPool.end();
  });
