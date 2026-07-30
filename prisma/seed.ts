/**
 * Momently — Database Seed
 * ---------------------------------------------------------------------
 * Populates a fresh database with enough data to develop and demo against:
 *   - 1 Admin user
 *   - 10 Templates (spanning the marketplace's occasion categories)
 *   - 3 Demo projects (owned by the admin, each built from a template)
 *
 * Run with: npm run db:seed  (wraps `tsx prisma/seed.ts`)
 *
 * Idempotent: every create uses `upsert` keyed on a unique field, so running
 * this repeatedly won't create duplicates — safe for local dev resets.
 */

import { PrismaClient, ProjectStatus } from "@prisma/client";

const prisma = new PrismaClient();

// ----------------------------------------------------------------------------
// Template catalog
// ----------------------------------------------------------------------------

const templates = [
  {
    slug: "golden-hour-letter",
    title: "Golden Hour Letter",
    category: "Birthday",
    isPremium: false,
    price: 0,
  },
  {
    slug: "paper-lantern-album",
    title: "Paper Lantern Album",
    category: "Anniversary",
    isPremium: true,
    price: 499,
  },
  {
    slug: "quiet-bloom-reel",
    title: "Quiet Bloom Reel",
    category: "Proposal",
    isPremium: true,
    price: 799,
  },
  {
    slug: "late-night-note",
    title: "Late Night Note",
    category: "Wedding",
    isPremium: true,
    price: 1299,
  },
  {
    slug: "first-light-scrapbook",
    title: "First Light Scrapbook",
    category: "Valentine",
    isPremium: false,
    price: 0,
  },
  {
    slug: "velvet-hour-timeline",
    title: "Velvet Hour Timeline",
    category: "Graduation",
    isPremium: true,
    price: 599,
  },
  {
    slug: "soft-landing-postcard",
    title: "Soft Landing Postcard",
    category: "Baby Announcement",
    isPremium: false,
    price: 0,
  },
  {
    slug: "open-window-diary",
    title: "Open Window Diary",
    category: "Farewell",
    isPremium: true,
    price: 399,
  },
  {
    slug: "slow-dance-frame",
    title: "Slow Dance Frame",
    category: "Anniversary",
    isPremium: true,
    price: 899,
  },
  {
    slug: "warm-static-chapter",
    title: "Warm Static Chapter",
    category: "Birthday",
    isPremium: false,
    price: 0,
  },
] as const;

async function seedTemplates() {
  const created = [];
  for (const tpl of templates) {
    const template = await prisma.template.upsert({
      where: { slug: tpl.slug },
      update: {},
      create: {
        slug: tpl.slug,
        title: tpl.title,
        category: tpl.category,
        thumbnail: `https://picsum.photos/seed/${tpl.slug}/640/480`,
        previewImages: [
          `https://picsum.photos/seed/${tpl.slug}-1/900/600`,
          `https://picsum.photos/seed/${tpl.slug}-2/900/600`,
          `https://picsum.photos/seed/${tpl.slug}-3/900/600`,
        ],
        description: `A ${tpl.category.toLowerCase()} template with a considered, cinematic feel — ${tpl.title}.`,
        isPremium: tpl.isPremium,
        price: tpl.price,
      },
    });
    created.push(template);
  }
  console.log(`Seeded ${created.length} templates.`);
  return created;
}

// ----------------------------------------------------------------------------
// Admin user
// ----------------------------------------------------------------------------

async function seedAdminUser() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@momently.app" },
    update: {},
    create: {
      fullName: "Momently Admin",
      email: "admin@momently.app",
      // No password set here — this seed only establishes the data shape.
      // Hashing/setting a real password is an auth-layer concern, out of
      // scope for this seed script.
      password: null,
      avatar: `https://picsum.photos/seed/momently-admin/200/200`,
      role: "ADMIN",
    },
  });
  console.log(`Seeded admin user: ${admin.email}`);
  return admin;
}

// ----------------------------------------------------------------------------
// Demo projects
// ----------------------------------------------------------------------------

async function seedDemoProjects(adminId: string, templateIds: string[]) {
  const demoProjects = [
    {
      slug: "demo-five-years-since",
      title: "Five Years Since",
      status: ProjectStatus.PUBLISHED,
      theme: "cinematic",
      font: "playfair-inter",
      primaryColor: "#7A1E2B",
      secondaryColor: "#F1D6D9",
      templateId: templateIds[1],
    },
    {
      slug: "demo-the-question",
      title: "The Question",
      status: ProjectStatus.DRAFT,
      theme: "romantic",
      font: "cormorant-work",
      primaryColor: "#8C1D2B",
      secondaryColor: "#FBF3EE",
      templateId: templateIds[2],
    },
    {
      slug: "demo-golden-birthday",
      title: "Golden Birthday",
      status: ProjectStatus.PUBLISHED,
      theme: "playful",
      font: "fraunces-manrope",
      primaryColor: "#B8964F",
      secondaryColor: "#2A2417",
      templateId: templateIds[0],
    },
  ];

  const created = [];
  for (const proj of demoProjects) {
    const project = await prisma.project.upsert({
      where: { slug: proj.slug },
      update: {},
      create: {
        slug: proj.slug,
        title: proj.title,
        status: proj.status,
        coverImage: `https://picsum.photos/seed/${proj.slug}-cover/1200/800`,
        theme: proj.theme,
        font: proj.font,
        primaryColor: proj.primaryColor,
        secondaryColor: proj.secondaryColor,
        publishedAt: proj.status === ProjectStatus.PUBLISHED ? new Date() : null,
        userId: adminId,
        templateId: proj.templateId,
        // A couple of illustrative media rows per project, so the
        // Project -> Media relation isn't left empty in a fresh seed.
        media: {
          create: [
            {
              type: "IMAGE",
              url: `https://picsum.photos/seed/${proj.slug}-1/800/800`,
              filename: `${proj.slug}-1.jpg`,
              mimeType: "image/jpeg",
              fileSize: 245_000,
              order: 0,
            },
            {
              type: "IMAGE",
              url: `https://picsum.photos/seed/${proj.slug}-2/800/800`,
              filename: `${proj.slug}-2.jpg`,
              mimeType: "image/jpeg",
              fileSize: 268_000,
              order: 1,
            },
          ],
        },
      },
    });
    created.push(project);
  }
  console.log(`Seeded ${created.length} demo projects.`);
  return created;
}

// ----------------------------------------------------------------------------
// Entry point
// ----------------------------------------------------------------------------

async function main() {
  const seededTemplates = await seedTemplates();
  const admin = await seedAdminUser();
  await seedDemoProjects(
    admin.id,
    seededTemplates.map((t) => t.id)
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
