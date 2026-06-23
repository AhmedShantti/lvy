import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  { name: "Living Room", slug: "living-room", image: "https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?w=1200" },
  { name: "Bedroom",     slug: "bedroom",     image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200" },
  { name: "Dining",      slug: "dining",      image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1200" },
  { name: "Office",      slug: "office",      image: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=1200" },
  { name: "Outdoor",     slug: "outdoor",     image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200" },
  { name: "Lighting",    slug: "lighting",    image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=1200" },
  { name: "Decor",       slug: "decor",       image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1200" },
];

const LOCAL_IMAGES = [
  "/toa-heftiba-LE3UlRqIFR0-unsplash.jpg",
  "/ceyda-ciftci-JO5Y80Fajjo-unsplash.jpg",
  "/toa-heftiba-GyG8thVBInw-unsplash.jpg",
  "/dmitry-mashkin-QAmRmIvSZZM-unsplash.jpg",
];

const sampleImg = (i: number) => LOCAL_IMAGES[i % LOCAL_IMAGES.length];

const KH = "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models";
const FURNITURE_MODELS = [
  `${KH}/SheenChair/glTF-Binary/SheenChair.glb`,
  `${KH}/GlamVelvetSofa/glTF-Binary/GlamVelvetSofa.glb`,
  `${KH}/SheenWoodLeatherSofa/glTF-Binary/SheenWoodLeatherSofa.glb`,
  `${KH}/ChairDamaskPurplegold/glTF-Binary/ChairDamaskPurplegold.glb`,
  `${KH}/AnisotropyBarnLamp/glTF-Binary/AnisotropyBarnLamp.glb`,
  `${KH}/IridescenceLamp/glTF-Binary/IridescenceLamp.glb`,
];

const productNames = [
  "Linen Lounge Sofa","Walnut Dining Table","Velvet Accent Chair","Oak Bookshelf","Boucle Armchair",
  "Marble Coffee Table","Rattan Bed Frame","Brass Floor Lamp","Ceramic Vase Set","Wool Area Rug",
  "Leather Ottoman","Cane Sideboard","Pendant Lamp","Linen Bed Set","Side Table",
  "Outdoor Lounge","Office Desk","Ergonomic Chair","Dining Bench","Bar Stool",
  "Velvet Sofa","Glass Cabinet","Wall Mirror","Throw Blanket","Floor Cushion",
  "Console Table","Reading Chair","Nightstand","Headboard","Dresser",
  "Bookcase","Bench","Bar Cart","TV Stand","Shelf",
  "Wardrobe","Sectional","Recliner","Loveseat","Daybed",
  "Patio Table","Hammock","Sunbed","Garden Chair","Planter",
  "Table Lamp","Sconce","Chandelier","Candle Holder","Picture Frame",
];

async function main() {
  console.log("🌱 Seeding LVY...");

  await prisma.review.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  const cats = await Promise.all(categories.map(c => prisma.category.create({ data: c })));

  for (let i = 0; i < productNames.length; i++) {
    const cat = cats[i % cats.length];
    const price = 199 + (i * 37) % 2400;
    await prisma.product.create({
      data: {
        name: productNames[i],
        slug: productNames[i].toLowerCase().replace(/\s+/g, "-") + "-" + (i + 1),
        description:
          "Crafted from sustainably sourced materials, this piece blends timeless silhouettes with modern comfort. Designed in our studio and built to last a lifetime.",
        price,
        compareAt: i % 4 === 0 ? price + 200 : null,
        images: [sampleImg(i), sampleImg(i + 1), sampleImg(i + 2)],
        material: ["Oak","Walnut","Linen","Velvet","Boucle","Rattan"][i % 6],
        color: ["Cream","Charcoal","Terracotta","Walnut","Sage"][i % 5],
        dimensions: `${80 + i}cm x ${60 + i}cm x ${40 + i}cm`,
        stock: 10 + (i % 20),
        model3dUrl: FURNITURE_MODELS[i % FURNITURE_MODELS.length],
        featured: i % 5 === 0,
        isNew: i % 7 === 0,
        rating: 4 + ((i % 10) / 10),
        categoryId: cat.id,
      },
    });
  }

  await prisma.user.create({
    data: {
      email: "admin@lvy.shop",
      name: "Admin",
      role: "ADMIN",
      emailVerified: true,
      passwordHash: await bcrypt.hash("admin1234", 10),
    },
  });
  await prisma.user.create({
    data: {
      email: "demo@lvy.shop",
      name: "Demo Customer",
      emailVerified: true,
      passwordHash: await bcrypt.hash("demo1234", 10),
    },
  });

  await prisma.coupon.create({
    data: { code: "WELCOME10", type: "percent", value: 10, active: true },
  });

  console.log("✅ Done. Login: admin@lvy.shop / admin1234  ·  demo@lvy.shop / demo1234");
}

main().finally(() => prisma.$disconnect());
