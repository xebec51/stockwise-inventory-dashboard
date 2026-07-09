-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGER', 'STAFF', 'SUPPLIER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'PENDING', 'REJECTED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INCOMING', 'OUTGOING');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "RestockOrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED', 'IN_TRANSIT', 'RECEIVED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "UserStatus" NOT NULL,
    "phone" TEXT,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "address" TEXT,
    "contact_person" TEXT,
    "phone" TEXT,
    "supplier_category" TEXT,
    "bank_account" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "description" TEXT,
    "purchase_price" DECIMAL(12,2) NOT NULL,
    "selling_price" DECIMAL(12,2) NOT NULL,
    "current_stock" INTEGER NOT NULL,
    "minimum_stock" INTEGER NOT NULL,
    "unit" TEXT NOT NULL,
    "rack_location" TEXT,
    "image_url" TEXT,
    "qr_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "transaction_number" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "approved_by" TEXT,
    "source_restock_order_id" TEXT,
    "type" "TransactionType" NOT NULL,
    "status" "TransactionStatus" NOT NULL,
    "destination" TEXT,
    "notes" TEXT,
    "transaction_date" TIMESTAMP(3) NOT NULL,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_items" (
    "id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "stock_before" INTEGER NOT NULL,
    "stock_after" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaction_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restock_orders" (
    "id" TEXT NOT NULL,
    "po_number" TEXT NOT NULL,
    "manager_id" TEXT NOT NULL,
    "supplier_id" TEXT NOT NULL,
    "status" "RestockOrderStatus" NOT NULL,
    "order_date" TIMESTAMP(3) NOT NULL,
    "expected_delivery_date" TIMESTAMP(3),
    "notes" TEXT,
    "confirmed_at" TIMESTAMP(3),
    "received_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restock_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restock_order_items" (
    "id" TEXT NOT NULL,
    "restock_order_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "estimated_price" DECIMAL(12,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restock_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_ratings" (
    "id" TEXT NOT NULL,
    "restock_order_id" TEXT NOT NULL,
    "manager_id" TEXT NOT NULL,
    "supplier_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "feedback" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplier_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_user_id_key" ON "suppliers"("user_id");

-- CreateIndex
CREATE INDEX "suppliers_company_name_idx" ON "suppliers"("company_name");

-- CreateIndex
CREATE INDEX "suppliers_supplier_category_idx" ON "suppliers"("supplier_category");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_name_idx" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "products_qr_code_key" ON "products"("qr_code");

-- CreateIndex
CREATE INDEX "products_category_id_idx" ON "products"("category_id");

-- CreateIndex
CREATE INDEX "products_name_idx" ON "products"("name");

-- CreateIndex
CREATE INDEX "products_current_stock_idx" ON "products"("current_stock");

-- CreateIndex
CREATE INDEX "products_minimum_stock_idx" ON "products"("minimum_stock");

-- CreateIndex
CREATE INDEX "products_rack_location_idx" ON "products"("rack_location");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_transaction_number_key" ON "transactions"("transaction_number");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_source_restock_order_id_key" ON "transactions"("source_restock_order_id");

-- CreateIndex
CREATE INDEX "transactions_created_by_idx" ON "transactions"("created_by");

-- CreateIndex
CREATE INDEX "transactions_approved_by_idx" ON "transactions"("approved_by");

-- CreateIndex
CREATE INDEX "transactions_source_restock_order_id_idx" ON "transactions"("source_restock_order_id");

-- CreateIndex
CREATE INDEX "transactions_type_idx" ON "transactions"("type");

-- CreateIndex
CREATE INDEX "transactions_status_idx" ON "transactions"("status");

-- CreateIndex
CREATE INDEX "transactions_transaction_date_idx" ON "transactions"("transaction_date");

-- CreateIndex
CREATE INDEX "transactions_created_at_idx" ON "transactions"("created_at");

-- CreateIndex
CREATE INDEX "transaction_items_transaction_id_idx" ON "transaction_items"("transaction_id");

-- CreateIndex
CREATE INDEX "transaction_items_product_id_idx" ON "transaction_items"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_items_transaction_id_product_id_key" ON "transaction_items"("transaction_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "restock_orders_po_number_key" ON "restock_orders"("po_number");

-- CreateIndex
CREATE INDEX "restock_orders_manager_id_idx" ON "restock_orders"("manager_id");

-- CreateIndex
CREATE INDEX "restock_orders_supplier_id_idx" ON "restock_orders"("supplier_id");

-- CreateIndex
CREATE INDEX "restock_orders_status_idx" ON "restock_orders"("status");

-- CreateIndex
CREATE INDEX "restock_orders_order_date_idx" ON "restock_orders"("order_date");

-- CreateIndex
CREATE INDEX "restock_orders_expected_delivery_date_idx" ON "restock_orders"("expected_delivery_date");

-- CreateIndex
CREATE INDEX "restock_order_items_restock_order_id_idx" ON "restock_order_items"("restock_order_id");

-- CreateIndex
CREATE INDEX "restock_order_items_product_id_idx" ON "restock_order_items"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "restock_order_items_restock_order_id_product_id_key" ON "restock_order_items"("restock_order_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_ratings_restock_order_id_key" ON "supplier_ratings"("restock_order_id");

-- CreateIndex
CREATE INDEX "supplier_ratings_manager_id_idx" ON "supplier_ratings"("manager_id");

-- CreateIndex
CREATE INDEX "supplier_ratings_supplier_id_idx" ON "supplier_ratings"("supplier_id");

-- CreateIndex
CREATE INDEX "supplier_ratings_rating_idx" ON "supplier_ratings"("rating");

-- CreateIndex
CREATE INDEX "activity_logs_user_id_idx" ON "activity_logs"("user_id");

-- CreateIndex
CREATE INDEX "activity_logs_module_idx" ON "activity_logs"("module");

-- CreateIndex
CREATE INDEX "activity_logs_action_idx" ON "activity_logs"("action");

-- CreateIndex
CREATE INDEX "activity_logs_created_at_idx" ON "activity_logs"("created_at");

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_source_restock_order_id_fkey" FOREIGN KEY ("source_restock_order_id") REFERENCES "restock_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_items" ADD CONSTRAINT "transaction_items_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_items" ADD CONSTRAINT "transaction_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restock_orders" ADD CONSTRAINT "restock_orders_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restock_orders" ADD CONSTRAINT "restock_orders_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restock_order_items" ADD CONSTRAINT "restock_order_items_restock_order_id_fkey" FOREIGN KEY ("restock_order_id") REFERENCES "restock_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restock_order_items" ADD CONSTRAINT "restock_order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_ratings" ADD CONSTRAINT "supplier_ratings_restock_order_id_fkey" FOREIGN KEY ("restock_order_id") REFERENCES "restock_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_ratings" ADD CONSTRAINT "supplier_ratings_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_ratings" ADD CONSTRAINT "supplier_ratings_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
