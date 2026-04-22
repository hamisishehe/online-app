-- CreateTable
CREATE TABLE "site_settings" (
    "id" SERIAL NOT NULL,
    "portalName" TEXT NOT NULL DEFAULT 'Online Application',
    "heroTitle" TEXT NOT NULL DEFAULT 'Apply for short courses',
    "heroDescription" TEXT NOT NULL DEFAULT 'Create an account, fill your education details, and submit your application.',
    "ctaText" TEXT NOT NULL DEFAULT 'Start application',
    "logoUrl" TEXT,
    "heroImageUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "duration" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);
