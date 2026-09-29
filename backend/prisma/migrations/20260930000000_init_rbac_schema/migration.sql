-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "resource" VARCHAR(50) NOT NULL,
    "action" VARCHAR(30) NOT NULL,
    "is_granted" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "bujk_id" TEXT,
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(150) NOT NULL,
    "phone_number" VARCHAR(20),
    "photo_url" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" VARCHAR(20) NOT NULL,
    "module" VARCHAR(50) NOT NULL,
    "record_id" VARCHAR(100),
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" VARCHAR(45),
    "user_agent" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "districts" (
    "id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "districts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bujk_master" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "entity_type" VARCHAR(20) NOT NULL,
    "nib" VARCHAR(13) NOT NULL,
    "npwp" VARCHAR(20) NOT NULL,
    "leader_name" VARCHAR(150) NOT NULL,
    "pjt_name" VARCHAR(150) NOT NULL,
    "pjsk_name" VARCHAR(150),
    "district_id" INTEGER,
    "address" TEXT NOT NULL,
    "postal_code" VARCHAR(10),
    "phone" VARCHAR(30) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "website" VARCHAR(150),
    "status" VARCHAR(30) NOT NULL DEFAULT 'APPROVED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bujk_master_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_code_key" ON "roles"("code");

-- CreateIndex
CREATE INDEX "role_permissions_role_id_idx" ON "role_permissions"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_id_resource_action_key" ON "role_permissions"("role_id", "resource", "action");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_id_idx" ON "users"("role_id");

-- CreateIndex
CREATE INDEX "users_bujk_id_idx" ON "users"("bujk_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_module_idx" ON "audit_logs"("module");

-- CreateIndex
CREATE UNIQUE INDEX "districts_code_key" ON "districts"("code");

-- CreateIndex
CREATE UNIQUE INDEX "bujk_master_nib_key" ON "bujk_master"("nib");

-- CreateIndex
CREATE UNIQUE INDEX "bujk_master_npwp_key" ON "bujk_master"("npwp");

-- CreateIndex
CREATE INDEX "bujk_master_district_id_idx" ON "bujk_master"("district_id");

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_bujk_id_fkey" FOREIGN KEY ("bujk_id") REFERENCES "bujk_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bujk_master" ADD CONSTRAINT "bujk_master_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
