-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('NEW_ORDER', 'ORDER_STATUS_CHANGE', 'LOW_STOCK', 'OUT_OF_STOCK', 'NEW_CUSTOMER', 'PAYMENT_RECEIVED', 'PAYMENT_FAILED', 'PRODUCTION_COMPLETE', 'SHIPPING_UPDATE', 'CONTACT_FORM', 'SYSTEM_ALERT', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "PersonalizationType" AS ENUM ('DTF', 'SUBLIMATION', 'LASER_CUT', 'EMBROIDERY', 'VINYL');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PRODUCTION', 'READY_FOR_PICKUP', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED', 'DRAFT');

-- CreateEnum
CREATE TYPE "ProductionStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('IN', 'OUT', 'ADJUSTMENT', 'RETURN');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING', 'BUY_X_GET_Y', 'PROGRESSIVE');

-- CreateEnum
CREATE TYPE "TargetType" AS ENUM ('ALL', 'PRODUCTS', 'CATEGORIES', 'USERS');

-- CreateEnum
CREATE TYPE "MaterialUnit" AS ENUM ('KG', 'G', 'L', 'ML', 'M', 'CM', 'M2', 'UNITS', 'ROLLS', 'SHEETS');

-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "MaterialCategory" AS ENUM ('TEXTILES', 'INKS', 'FILMS', 'SUBSTRATES', 'TOOLS', 'PACKAGING', 'CHEMICALS', 'OTHER');

-- CreateEnum
CREATE TYPE "MaterialMovementType" AS ENUM ('PURCHASE', 'CONSUMPTION', 'ADJUSTMENT', 'RETURN', 'WASTE', 'TRANSFER');

-- CreateEnum
CREATE TYPE "PurchaseOrderStatus" AS ENUM ('PENDING', 'SENT', 'CONFIRMED', 'SHIPPED', 'RECEIVED', 'PARTIALLY_RECEIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "StockAlertType" AS ENUM ('LOW_STOCK', 'OUT_OF_STOCK', 'OVERSTOCK', 'EXPIRED', 'REORDER_POINT');

-- CreateEnum
CREATE TYPE "ProcessDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD', 'EXPERT');

-- CreateEnum
CREATE TYPE "ProcessCategory" AS ENUM ('DTF_PRINTING', 'SUBLIMATION', 'LASER_CUTTING', 'VINYL_CUTTING', 'EMBROIDERY', 'ASSEMBLY', 'FINISHING', 'QUALITY_CONTROL', 'PACKAGING', 'DESIGN', 'OTHER');

-- CreateEnum
CREATE TYPE "MenuLocation" AS ENUM ('HEADER', 'FOOTER', 'SIDEBAR', 'MOBILE', 'BREADCRUMB', 'CATEGORY');

-- CreateEnum
CREATE TYPE "MenuTarget" AS ENUM ('SELF', 'BLANK', 'PARENT', 'TOP');

-- CreateEnum
CREATE TYPE "LinkType" AS ENUM ('CUSTOM', 'HOME', 'CATEGORY', 'PRODUCT', 'PAGE', 'EXTERNAL', 'CUSTOMIZER');

-- CreateEnum
CREATE TYPE "PageType" AS ENUM ('HOME', 'ABOUT', 'CONTACT', 'TERMS', 'PRIVACY', 'FAQ', 'BLOG', 'GALLERY', 'SERVICES', 'CUSTOMIZER', 'CATALOG');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'APPROVED', 'COMPLETED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('REGULAR', 'FEATURED', 'TOP_SALES', 'SPECIAL');

-- CreateEnum
CREATE TYPE "DesignCategory" AS ENUM ('INVITATIONS', 'DECORATIONS', 'STATIONERY', 'SIGNAGE', 'APPAREL', 'ACCESSORIES', 'DIGITAL');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('WEDDING', 'BAPTISM', 'BIRTHDAY', 'QUINCEAÑERA', 'BABY_SHOWER', 'GRADUATION', 'ANNIVERSARY', 'CORPORATE', 'FUNERAL', 'SEASONAL');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('IMAGE', 'ICON', 'ILLUSTRATION', 'BACKGROUND', 'TEXTURE', 'PATTERN', 'FONT', 'SHAPE');

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "phone" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'ES',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "categoryType" "CategoryType" NOT NULL DEFAULT 'REGULAR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_categories" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_suppliers" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "cost" DOUBLE PRECISION,
    "minOrder" INTEGER,
    "leadTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sku" TEXT,
    "description" TEXT,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "comparePrice" DOUBLE PRECISION,
    "costPrice" DOUBLE PRECISION,
    "images" TEXT NOT NULL DEFAULT '[]',
    "videos" TEXT NOT NULL DEFAULT '[]',
    "documents" TEXT NOT NULL DEFAULT '[]',
    "hasQuantityPricing" BOOLEAN NOT NULL DEFAULT false,
    "quantityPrices" TEXT NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "topSelling" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "materialType" TEXT,
    "canCustomize" BOOLEAN NOT NULL DEFAULT true,
    "customizationPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personalization_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "templateData" TEXT NOT NULL,
    "previewImage" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "productId" TEXT,
    "isGlobal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personalization_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "size" TEXT,
    "colorName" TEXT,
    "colorHex" TEXT,
    "colorDisplay" TEXT,
    "material" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "price" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "productId" TEXT NOT NULL,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_movements" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "type" "MovementType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "website" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materials" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sku" TEXT NOT NULL,
    "unit" "MaterialUnit" NOT NULL,
    "currentStock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minimumStock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maximumStock" DOUBLE PRECISION,
    "costPerUnit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "supplierId" TEXT,
    "location" TEXT,
    "category" "MaterialCategory" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_movements" (
    "id" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "type" "MaterialMovementType" NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unitCost" DOUBLE PRECISION,
    "reason" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "material_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "status" "PurchaseOrderStatus" NOT NULL DEFAULT 'PENDING',
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "expectedDate" TIMESTAMP(3),
    "receivedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demand_forecasts" (
    "id" TEXT NOT NULL,
    "materialId" TEXT,
    "variantId" TEXT,
    "predictedDemand" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "period" TEXT NOT NULL,
    "algorithm" TEXT NOT NULL DEFAULT 'moving_average',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "demand_forecasts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_alerts" (
    "id" TEXT NOT NULL,
    "type" "StockAlertType" NOT NULL,
    "materialId" TEXT,
    "variantId" TEXT,
    "threshold" DOUBLE PRECISION NOT NULL,
    "currentStock" DOUBLE PRECISION NOT NULL,
    "message" TEXT NOT NULL,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "stock_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "designs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "canvasData" JSONB NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "previewUrls" JSONB,
    "category" "DesignCategory" NOT NULL,
    "subcategory" TEXT,
    "tags" TEXT[],
    "eventType" "EventType",
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isDraft" BOOLEAN NOT NULL DEFAULT true,
    "dimensions" JSONB NOT NULL,
    "supportedFormats" TEXT[],
    "productId" TEXT,
    "createdById" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "parentDesignId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION,

    CONSTRAINT "designs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "shippingCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "customerEmail" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT,
    "shippingMethod" TEXT NOT NULL,
    "shippingAddress" JSONB,
    "trackingNumber" TEXT,
    "paymentMethod" TEXT NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "stripePaymentId" TEXT,
    "customerNotes" TEXT,
    "adminNotes" TEXT,
    "userId" TEXT,
    "addressId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "customizationData" JSONB,
    "productionNotes" TEXT,
    "productionStatus" "ProductionStatus" NOT NULL DEFAULT 'PENDING',
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "designId" TEXT,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "subtotal" DOUBLE PRECISION NOT NULL,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0.21,
    "taxAmount" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidDate" TIMESTAMP(3),
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    "customerTaxId" TEXT,
    "billingAddress" JSONB NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyAddress" JSONB NOT NULL,
    "companyTaxId" TEXT NOT NULL,
    "companyPhone" TEXT,
    "companyEmail" TEXT,
    "lineItems" JSONB NOT NULL,
    "notes" TEXT,
    "paymentTerms" TEXT,
    "pdfUrl" TEXT,
    "orderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_methods" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "estimatedDays" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipping_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discounts" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DiscountType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "minOrderAmount" DOUBLE PRECISION,
    "maxOrderAmount" DOUBLE PRECISION,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "usesPerCustomer" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3),
    "targetType" "TargetType" NOT NULL DEFAULT 'ALL',
    "targetIds" JSONB NOT NULL DEFAULT '[]',
    "excludeIds" JSONB NOT NULL DEFAULT '[]',
    "stackable" BOOLEAN NOT NULL DEFAULT false,
    "firstTimeOnly" BOOLEAN NOT NULL DEFAULT false,
    "autoApply" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT NOT NULL DEFAULT '',
    "internalNotes" TEXT NOT NULL DEFAULT '',
    "geographicRestrictions" JSONB NOT NULL DEFAULT '[]',
    "deviceRestrictions" JSONB NOT NULL DEFAULT '[]',
    "timeRestrictions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_submissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "orderType" TEXT,
    "status" "ContactStatus" NOT NULL DEFAULT 'PENDING',
    "adminNotes" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "priority" "NotificationPriority" NOT NULL DEFAULT 'MEDIUM',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "actionUrl" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "userId" TEXT,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workshop_processes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "productId" TEXT NOT NULL,
    "estimatedTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "difficulty" "ProcessDifficulty" NOT NULL DEFAULT 'MEDIUM',
    "category" "ProcessCategory" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "designFiles" JSONB NOT NULL DEFAULT '[]',
    "instructionFiles" JSONB NOT NULL DEFAULT '[]',
    "referenceImages" JSONB NOT NULL DEFAULT '[]',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workshop_processes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "process_steps" (
    "id" TEXT NOT NULL,
    "processId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "estimatedTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "instructions" TEXT,
    "imageUrls" JSONB NOT NULL DEFAULT '[]',
    "videoUrls" JSONB NOT NULL DEFAULT '[]',
    "fileUrls" JSONB NOT NULL DEFAULT '[]',
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "requiresQC" BOOLEAN NOT NULL DEFAULT false,
    "safetyNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "process_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "process_materials" (
    "id" TEXT NOT NULL,
    "processId" TEXT NOT NULL,
    "materialId" TEXT,
    "name" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "description" TEXT,
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "estimatedCost" DOUBLE PRECISION,
    "supplier" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "process_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "process_equipment" (
    "id" TEXT NOT NULL,
    "processId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "specifications" TEXT NOT NULL DEFAULT '{}',
    "settings" TEXT NOT NULL DEFAULT '{}',
    "alternatives" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "process_equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "process_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "ProcessCategory" NOT NULL,
    "templateData" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "process_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menus" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "location" "MenuLocation" NOT NULL DEFAULT 'HEADER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "maxDepth" INTEGER NOT NULL DEFAULT 3,
    "showOnMobile" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_items" (
    "id" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT,
    "target" "MenuTarget" NOT NULL DEFAULT 'SELF',
    "linkType" "LinkType" NOT NULL DEFAULT 'CUSTOM',
    "categoryId" TEXT,
    "productId" TEXT,
    "pageType" "PageType",
    "parentId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "cssClass" TEXT,
    "icon" TEXT,
    "badge" TEXT,
    "title" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_reservations" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,

    CONSTRAINT "stock_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_transactions" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" "TransactionType" NOT NULL,
    "category" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "vendor" TEXT,
    "customer" TEXT,
    "orderId" TEXT,
    "invoiceId" TEXT,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT NOT NULL,
    "receiptUrl" TEXT,
    "notes" TEXT,
    "tags" TEXT[],
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "budget" DOUBLE PRECISION,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "design_assets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "type" "AssetType" NOT NULL,
    "format" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "dimensions" JSONB,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "tags" TEXT[],
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "colorPalette" JSONB,
    "style" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "design_assets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_productId_categoryId_key" ON "product_categories"("productId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "product_suppliers_productId_supplierId_key" ON "product_suppliers"("productId", "supplierId");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_sku_key" ON "product_variants"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "materials_sku_key" ON "materials"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_orderNumber_key" ON "purchase_orders"("orderNumber");

-- CreateIndex
CREATE INDEX "designs_category_eventType_idx" ON "designs"("category", "eventType");

-- CreateIndex
CREATE INDEX "designs_isTemplate_isPublic_idx" ON "designs"("isTemplate", "isPublic");

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON "invoices"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_key" ON "settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "shipping_methods_name_key" ON "shipping_methods"("name");

-- CreateIndex
CREATE UNIQUE INDEX "discounts_code_key" ON "discounts"("code");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_isRead_idx" ON "notifications"("isRead");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "process_steps_processId_stepNumber_key" ON "process_steps"("processId", "stepNumber");

-- CreateIndex
CREATE UNIQUE INDEX "menus_slug_key" ON "menus"("slug");

-- CreateIndex
CREATE INDEX "stock_reservations_sessionId_idx" ON "stock_reservations"("sessionId");

-- CreateIndex
CREATE INDEX "stock_reservations_variantId_idx" ON "stock_reservations"("variantId");

-- CreateIndex
CREATE INDEX "stock_reservations_expiresAt_idx" ON "stock_reservations"("expiresAt");

-- CreateIndex
CREATE INDEX "financial_transactions_type_idx" ON "financial_transactions"("type");

-- CreateIndex
CREATE INDEX "financial_transactions_category_idx" ON "financial_transactions"("category");

-- CreateIndex
CREATE INDEX "financial_transactions_date_idx" ON "financial_transactions"("date");

-- CreateIndex
CREATE INDEX "financial_transactions_status_idx" ON "financial_transactions"("status");

-- CreateIndex
CREATE INDEX "financial_transactions_createdBy_idx" ON "financial_transactions"("createdBy");

-- CreateIndex
CREATE INDEX "financial_categories_type_idx" ON "financial_categories"("type");

-- CreateIndex
CREATE INDEX "financial_categories_isActive_idx" ON "financial_categories"("isActive");

-- CreateIndex
CREATE INDEX "design_assets_type_category_idx" ON "design_assets"("type", "category");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_suppliers" ADD CONSTRAINT "product_suppliers_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_suppliers" ADD CONSTRAINT "product_suppliers_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personalization_templates" ADD CONSTRAINT "personalization_templates_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materials" ADD CONSTRAINT "materials_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_movements" ADD CONSTRAINT "material_movements_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_movements" ADD CONSTRAINT "material_movements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demand_forecasts" ADD CONSTRAINT "demand_forecasts_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materials"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demand_forecasts" ADD CONSTRAINT "demand_forecasts_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_alerts" ADD CONSTRAINT "stock_alerts_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materials"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_alerts" ADD CONSTRAINT "stock_alerts_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "designs" ADD CONSTRAINT "designs_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "designs" ADD CONSTRAINT "designs_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "designs" ADD CONSTRAINT "designs_parentDesignId_fkey" FOREIGN KEY ("parentDesignId") REFERENCES "designs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_designId_fkey" FOREIGN KEY ("designId") REFERENCES "designs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workshop_processes" ADD CONSTRAINT "workshop_processes_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "process_steps" ADD CONSTRAINT "process_steps_processId_fkey" FOREIGN KEY ("processId") REFERENCES "workshop_processes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "process_materials" ADD CONSTRAINT "process_materials_processId_fkey" FOREIGN KEY ("processId") REFERENCES "workshop_processes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "process_materials" ADD CONSTRAINT "process_materials_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materials"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "process_equipment" ADD CONSTRAINT "process_equipment_processId_fkey" FOREIGN KEY ("processId") REFERENCES "workshop_processes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "menu_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_reservations" ADD CONSTRAINT "stock_reservations_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
