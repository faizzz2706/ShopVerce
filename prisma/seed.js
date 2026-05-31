/* eslint-disable no-console */
require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const pg = require("pg");
const bcrypt = require("bcryptjs");

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const PRODUCT_IMAGES = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
  "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600",
  "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600",
  "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600",
  "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600",
  "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600",
  "https://images.unsplash.com/photo-1611312449504-6fd9f9a7d3b3?w=600",
];

const CATEGORIES = [
  {
    name: "Electronics",
    slug: "electronics",
    subs: ["Smartphones", "Laptops", "Audio", "Cameras"],
  },
  {
    name: "Fashion",
    slug: "fashion",
    subs: ["Men", "Women", "Kids", "Footwear"],
  },
  {
    name: "Home & Kitchen",
    slug: "home-kitchen",
    subs: ["Furniture", "Appliances", "Decor", "Cookware"],
  },
  {
    name: "Beauty",
    slug: "beauty",
    subs: ["Skincare", "Makeup", "Haircare", "Fragrance"],
  },
  {
    name: "Sports",
    slug: "sports",
    subs: ["Fitness", "Outdoor", "Cycling", "Team Sports"],
  },
  {
    name: "Grocery",
    slug: "grocery",
    subs: ["Snacks", "Beverages", "Dairy", "Staples"],
  },
];

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPrice(min, max) {
  return (Math.random() * (max - min) + min).toFixed(2);
}

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.orderStatusHistory.deleteMany();
  await prisma.returnRequest.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.recentlyViewed.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.subCategory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.emailVerificationToken.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Password@123", 12);

  await prisma.user.create({
    data: {
      email: "admin@shopverse.com",
      password: passwordHash,
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN",
      emailVerified: true,
      phone: "+919999999999",
    },
  });

  const customers = await Promise.all(
    Array.from({ length: 5 }).map((_, i) =>
      prisma.user.create({
        data: {
          email: `customer${i + 1}@shopverse.com`,
          password: passwordHash,
          firstName: `Customer`,
          lastName: `${i + 1}`,
          role: "CUSTOMER",
          emailVerified: true,
          phone: `+91987654321${i}`,
        },
      })
    )
  );

  const coupons = await Promise.all([
    prisma.coupon.create({
      data: {
        code: "WELCOME10",
        type: "PERCENTAGE",
        value: 10,
        minPurchase: 500,
        maxUses: 1000,
        active: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.coupon.create({
      data: {
        code: "FLAT100",
        type: "FIXED",
        value: 100,
        minPurchase: 999,
        maxUses: 500,
        active: true,
      },
    }),
    prisma.coupon.create({
      data: {
        code: "MEGA20",
        type: "PERCENTAGE",
        value: 20,
        minPurchase: 2000,
        maxUses: 200,
        active: true,
      },
    }),
  ]);

  const categoryMap = [];
  for (const cat of CATEGORIES) {
    const category = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        description: `Shop the best ${cat.name.toLowerCase()} products`,
        image: randomFrom(PRODUCT_IMAGES),
      },
    });
    const subs = [];
    for (const subName of cat.subs) {
      const sub = await prisma.subCategory.create({
        data: {
          categoryId: category.id,
          name: subName,
          slug: slugify(subName),
          description: `${subName} in ${cat.name}`,
        },
      });
      subs.push(sub);
    }
    categoryMap.push({ category, subs });
  }

  const productNames = [
    "Wireless Bluetooth Headphones",
    "Smart Fitness Watch",
    "Ultra HD Action Camera",
    "Portable Power Bank 20000mAh",
    "Mechanical Gaming Keyboard",
    "Ergonomic Office Chair",
    "Stainless Steel Cookware Set",
    "Organic Green Tea Pack",
    "Running Shoes Pro",
    "Cotton Casual T-Shirt",
    "Denim Slim Fit Jeans",
    "Leather Crossbody Bag",
    "Vitamin C Face Serum",
    "Hydrating Moisturizer",
    "Yoga Mat Premium",
    "Adjustable Dumbbell Set",
    "Camping Tent 4-Person",
    "Mountain Bike Helmet",
    "Smart LED Bulb Pack",
    "Robot Vacuum Cleaner",
    "Air Fryer Digital",
    "Memory Foam Pillow",
    "Ceramic Dinner Set",
    "Insulated Water Bottle",
    "Protein Powder 1kg",
    "Dark Chocolate Assorted",
    "Instant Coffee Premium",
    "Basmati Rice 5kg",
    "Sunscreen SPF 50",
    "Hair Dryer Professional",
    "Sunglasses Polarized",
    "Smartphone Case Rugged",
    "USB-C Hub 7-in-1",
    "Laptop Stand Aluminum",
    "Wireless Mouse Silent",
    "Graphic Tablet Drawing",
    "Bluetooth Speaker Mini",
    "True Wireless Earbuds",
    "DSLR Camera Lens Kit",
    "Tripod Stand Flexible",
    "Kids Educational Tablet",
    "Baby Stroller Lightweight",
    "Pet Food Premium 3kg",
    "Cat Litter Clumping",
    "Garden Tool Set",
    "Indoor Plant Pot Set",
    "Wall Clock Modern",
    "Bed Sheet Cotton King",
    "Towel Set Luxury",
    "Shampoo Anti-Dandruff",
    "Perfume Eau de Parfum",
    "Sneakers Limited Edition",
    "Winter Jacket Thermal",
    "Sports Water Bottle",
    "Cricket Bat English Willow",
    "Football Size 5",
    "Tennis Racket Carbon",
  ];

  const products = [];
  let productIndex = 0;
  for (const { category, subs } of categoryMap) {
    const productsPerCat = Math.ceil(50 / categoryMap.length);
    for (let i = 0; i < productsPerCat && productIndex < 50; i++) {
      const name =
        productNames[productIndex] ||
        `${category.name} Product ${productIndex + 1}`;
      const sub = randomFrom(subs);
      const price = randomPrice(199, 49999);
      const comparePrice = (
        parseFloat(price) * (1 + Math.random() * 0.3)
      ).toFixed(2);
      const product = await prisma.product.create({
        data: {
          name,
          slug: `${slugify(name)}-${productIndex + 1}`,
          description: `${name} - Premium quality product with excellent features.`,
          price,
          comparePrice,
          stock: Math.floor(Math.random() * 200) + 10,
          sku: `SKU-${10000 + productIndex}`,
          categoryId: category.id,
          subCategoryId: sub.id,
          featured: productIndex < 8,
          bestSeller: productIndex >= 8 && productIndex < 16,
          newArrival: productIndex >= 16 && productIndex < 24,
          averageRating: +(3.5 + Math.random() * 1.5).toFixed(1),
          reviewCount: Math.floor(Math.random() * 50),
          images: {
            create: Array.from({ length: 3 }).map((_, imgIdx) => ({
              url: PRODUCT_IMAGES[(productIndex + imgIdx) % PRODUCT_IMAGES.length],
              alt: name,
              sortOrder: imgIdx,
            })),
          },
        },
      });
      products.push(product);
      productIndex++;
    }
  }

  for (const customer of customers) {
    await prisma.cart.create({ data: { userId: customer.id } });
    await prisma.address.create({
      data: {
        userId: customer.id,
        type: "SHIPPING",
        label: "Home",
        street: "123 Main Street",
        city: "Mumbai",
        state: "Maharashtra",
        zip: "400001",
        country: "India",
        isDefault: true,
      },
    });
  }

  const reviewComments = [
    "Excellent product, highly recommended!",
    "Good value for money.",
    "Fast delivery and great packaging.",
    "Works as expected, satisfied with purchase.",
  ];

  for (let i = 0; i < 80; i++) {
    const customer = randomFrom(customers);
    const product = randomFrom(products);
    try {
      await prisma.review.create({
        data: {
          userId: customer.id,
          productId: product.id,
          rating: Math.floor(Math.random() * 2) + 4,
          title: "Great purchase",
          comment: randomFrom(reviewComments),
          approved: Math.random() > 0.2,
        },
      });
    } catch {
      // skip duplicate reviews
    }
  }

  for (const product of products) {
    const reviews = await prisma.review.findMany({
      where: { productId: product.id, approved: true },
    });
    if (reviews.length) {
      const avg =
        reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
      await prisma.product.update({
        where: { id: product.id },
        data: {
          averageRating: avg,
          reviewCount: reviews.length,
        },
      });
    }
  }

  await prisma.banner.createMany({
    data: [
      {
        title: "Mega Sale",
        subtitle: "Up to 50% off on electronics",
        imageUrl:
          "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200",
        link: "/shop?featured=true",
        position: "hero",
        sortOrder: 1,
      },
      {
        title: "Fresh Grocery",
        subtitle: "Delivered in 10 minutes",
        imageUrl:
          "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200",
        link: "/shop?category=grocery",
        position: "hero",
        sortOrder: 2,
      },
      {
        title: "Fashion Week",
        subtitle: "Trending styles for you",
        imageUrl:
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200",
        link: "/shop?category=fashion",
        position: "secondary",
        sortOrder: 3,
      },
    ],
  });

  await prisma.notification.createMany({
    data: customers.flatMap((c) => [
      {
        userId: c.id,
        type: "PROMO",
        title: "Welcome to ShopVerse!",
        message: "Get 10% off your first order with code WELCOME10",
        link: "/shop",
      },
      {
        userId: c.id,
        type: "ORDER",
        title: "Order updates",
        message: "Track your orders anytime from your dashboard",
        link: "/orders",
      },
    ]),
  });

  console.log("✅ Seed completed!");
  console.log("   Admin: admin@shopverse.com / Password@123");
  console.log("   Customer: customer1@shopverse.com / Password@123");
  console.log(`   Products: ${products.length}`);
  console.log(`   Coupons: ${coupons.map((c) => c.code).join(", ")}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
