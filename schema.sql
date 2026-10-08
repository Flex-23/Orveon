-- ============================================================
-- Orveon Platform — schema.sql (المرحلة 1)
-- مطابق لملف prisma/schema.prisma
-- شغّله في phpMyAdmin (XAMPP) داخل قاعدة بيانات اسمها: orveon
-- المحرّك: InnoDB | الترميز: utf8mb4
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------- المستخدمون ----------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id`            INT NOT NULL AUTO_INCREMENT,
  `name`          VARCHAR(150) NOT NULL,
  `phone`         VARCHAR(30)  NOT NULL,
  `governorate`   VARCHAR(100) NULL,
  `password_hash` VARCHAR(255) NULL,
  `password_enc`  VARCHAR(512) NULL,
  `login_code`    VARCHAR(100) NULL,
  `role`          ENUM('visitor','member','admin','manager') NOT NULL DEFAULT 'visitor',
  `is_banned`     BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at`    DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`    DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_phone_key` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------- صلاحيات الأدمن ----------------------
CREATE TABLE IF NOT EXISTS `admin_permissions` (
  `id`                      INT NOT NULL AUTO_INCREMENT,
  `user_id`                 INT NOT NULL,
  `can_access_dashboard`    BOOLEAN NOT NULL DEFAULT FALSE,
  `can_manage_products`     BOOLEAN NOT NULL DEFAULT FALSE,
  `can_manage_orders`       BOOLEAN NOT NULL DEFAULT FALSE,
  `can_manage_reservations` BOOLEAN NOT NULL DEFAULT FALSE,
  `can_manage_members`      BOOLEAN NOT NULL DEFAULT FALSE,
  `can_manage_dues`         BOOLEAN NOT NULL DEFAULT FALSE,
  `can_manage_services`     BOOLEAN NOT NULL DEFAULT FALSE,
  `can_manage_content`      BOOLEAN NOT NULL DEFAULT FALSE,
  `can_manage_projects`     BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at`              DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`              DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `admin_permissions_user_id_key` (`user_id`),
  CONSTRAINT `admin_permissions_user_id_fkey` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------- الأعمال ----------------------
CREATE TABLE IF NOT EXISTS `works` (
  `id`          INT NOT NULL AUTO_INCREMENT,
  `title`       VARCHAR(200) NOT NULL,
  `description` TEXT NULL,
  `image_url`   VARCHAR(500) NULL,
  `created_at`  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------- الخدمات ----------------------
CREATE TABLE IF NOT EXISTS `services` (
  `id`                INT NOT NULL AUTO_INCREMENT,
  `title`             VARCHAR(200) NOT NULL,
  `description`       TEXT NULL,
  `download_file_url` VARCHAR(500) NULL,
  `created_at`        DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`        DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------- صور الخدمات ----------------------
CREATE TABLE IF NOT EXISTS `service_images` (
  `id`         INT NOT NULL AUTO_INCREMENT,
  `service_id` INT NOT NULL,
  `image_url`  VARCHAR(500) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `service_images_service_id_idx` (`service_id`),
  CONSTRAINT `service_images_service_id_fkey` FOREIGN KEY (`service_id`)
    REFERENCES `services` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------- فيديوهات الخدمات ----------------------
CREATE TABLE IF NOT EXISTS `service_videos` (
  `id`         INT NOT NULL AUTO_INCREMENT,
  `service_id` INT NOT NULL,
  `video_url`  VARCHAR(500) NOT NULL,
  `title`      VARCHAR(200) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `service_videos_service_id_idx` (`service_id`),
  CONSTRAINT `service_videos_service_id_fkey` FOREIGN KEY (`service_id`)
    REFERENCES `services` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------- مبالغ إضافية على المشتركين ----------------------
CREATE TABLE IF NOT EXISTS `extra_charges` (
  `id`          INT NOT NULL AUTO_INCREMENT,
  `user_id`     INT NOT NULL,
  `label`       VARCHAR(200) NOT NULL,
  `amount`      DECIMAL(10,2) NOT NULL,
  `paid_amount` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `created_at`  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `extra_charges_user_id_idx` (`user_id`),
  CONSTRAINT `extra_charges_user_id_fkey` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------- الأقسام ----------------------
CREATE TABLE IF NOT EXISTS `categories` (
  `id`         INT NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(150) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_name_key` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------- المنتجات ----------------------
CREATE TABLE IF NOT EXISTS `products` (
  `id`          INT NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(200) NOT NULL,
  `category_id` INT NULL,
  `quantity`    INT NOT NULL DEFAULT 0,
  `price`       DECIMAL(10,2) NOT NULL,
  `image_url`   VARCHAR(500) NULL,
  `status`      ENUM('available','out_of_stock','coming_soon') NOT NULL DEFAULT 'available',
  `created_at`  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `products_category_id_idx` (`category_id`),
  CONSTRAINT `products_category_id_fkey` FOREIGN KEY (`category_id`)
    REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------- السلة ----------------------
CREATE TABLE IF NOT EXISTS `carts` (
  `id`         INT NOT NULL AUTO_INCREMENT,
  `user_id`    INT NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `carts_user_id_key` (`user_id`),
  CONSTRAINT `carts_user_id_fkey` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------- عناصر السلة ----------------------
CREATE TABLE IF NOT EXISTS `cart_items` (
  `id`         INT NOT NULL AUTO_INCREMENT,
  `cart_id`    INT NOT NULL,
  `product_id` INT NOT NULL,
  `quantity`   INT NOT NULL DEFAULT 1,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `cart_items_cart_id_product_id_key` (`cart_id`, `product_id`),
  KEY `cart_items_product_id_idx` (`product_id`),
  CONSTRAINT `cart_items_cart_id_fkey` FOREIGN KEY (`cart_id`)
    REFERENCES `carts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cart_items_product_id_fkey` FOREIGN KEY (`product_id`)
    REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------- الطلبات ----------------------
CREATE TABLE IF NOT EXISTS `orders` (
  `id`               INT NOT NULL AUTO_INCREMENT,
  `user_id`          INT NOT NULL,
  `total`            DECIMAL(10,2) NOT NULL,
  `payment_method`   ENUM('online','cash_on_delivery') NOT NULL,
  `payment_status`   ENUM('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  `order_status`     ENUM('pending','processing','shipping','delivered') NOT NULL DEFAULT 'pending',
  `delivery_name`    VARCHAR(150) NULL,
  `delivery_phone`   VARCHAR(30) NULL,
  `governorate`      VARCHAR(100) NULL,
  `address`          VARCHAR(500) NULL,
  `nearest_landmark` VARCHAR(255) NULL,
  `created_at`       DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`       DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `orders_user_id_idx` (`user_id`),
  CONSTRAINT `orders_user_id_fkey` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------- عناصر الطلب ----------------------
CREATE TABLE IF NOT EXISTS `order_items` (
  `id`         INT NOT NULL AUTO_INCREMENT,
  `order_id`   INT NOT NULL,
  `product_id` INT NOT NULL,
  `quantity`   INT NOT NULL DEFAULT 1,
  `unit_price` DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_items_order_id_idx` (`order_id`),
  KEY `order_items_product_id_idx` (`product_id`),
  CONSTRAINT `order_items_order_id_fkey` FOREIGN KEY (`order_id`)
    REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `order_items_product_id_fkey` FOREIGN KEY (`product_id`)
    REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------- الحجوزات ----------------------
CREATE TABLE IF NOT EXISTS `reservations` (
  `id`               INT NOT NULL AUTO_INCREMENT,
  `user_id`          INT NULL,
  `name`             VARCHAR(150) NULL,
  `phone`            VARCHAR(30) NULL,
  `governorate`      VARCHAR(100) NULL,
  `nearest_landmark` VARCHAR(255) NULL,
  `quantity`         INT NOT NULL DEFAULT 1,
  `product_id`       INT NOT NULL,
  `price`            DECIMAL(10,2) NOT NULL,
  `status`     ENUM('pending','confirmed','cancelled','fulfilled') NOT NULL DEFAULT 'pending',
  `details`    TEXT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `reservations_user_id_idx` (`user_id`),
  KEY `reservations_product_id_idx` (`product_id`),
  CONSTRAINT `reservations_user_id_fkey` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `reservations_product_id_fkey` FOREIGN KEY (`product_id`)
    REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------- طلبات النسخ التجريبية ----------------------
CREATE TABLE IF NOT EXISTS `trial_requests` (
  `id`          INT NOT NULL AUTO_INCREMENT,
  `user_id`     INT NULL,
  `work_id`     INT NULL,
  `work_title`  VARCHAR(200) NOT NULL,
  `name`        VARCHAR(150) NOT NULL,
  `phone`       VARCHAR(30) NOT NULL,
  `governorate` VARCHAR(100) NULL,
  `details`     TEXT NULL,
  `status`      ENUM('pending','responded','rejected') NOT NULL DEFAULT 'pending',
  `created_at`  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `trial_requests_user_id_idx` (`user_id`),
  KEY `trial_requests_work_id_idx` (`work_id`),
  CONSTRAINT `trial_requests_user_id_fkey` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `trial_requests_work_id_fkey` FOREIGN KEY (`work_id`)
    REFERENCES `works` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------- طلبات المشاريع ----------------------
-- طلب «ابدأ مشروعك» من الصفحة الرئيسية: لقطة بيانات الزبون + وصف المشروع والمدة (بدون سعر).
CREATE TABLE IF NOT EXISTS `project_requests` (
  `id`          INT NOT NULL AUTO_INCREMENT,
  `user_id`     INT NULL,
  `name`        VARCHAR(150) NOT NULL,
  `phone`       VARCHAR(30) NOT NULL,
  `governorate` VARCHAR(100) NULL,
  `description` TEXT NOT NULL,
  `duration`    VARCHAR(100) NOT NULL,
  `status`      ENUM('pending','reviewing','approved','in_progress','completed','rejected') NOT NULL DEFAULT 'pending',
  `created_at`  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `project_requests_user_id_idx` (`user_id`),
  CONSTRAINT `project_requests_user_id_fkey` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------- الاشتراكات ----------------------
CREATE TABLE IF NOT EXISTS `subscriptions` (
  `id`           INT NOT NULL AUTO_INCREMENT,
  `user_id`      INT NOT NULL,
  `service_name` VARCHAR(200) NOT NULL,
  `end_date`     DATETIME(3) NULL,
  `login_code`   VARCHAR(100) NULL,
  `total_amount` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `paid_amount`  DECIMAL(10,2) NOT NULL DEFAULT 0,
  `created_by`   INT NULL,
  `created_at`   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `subscriptions_user_id_idx` (`user_id`),
  KEY `subscriptions_created_by_idx` (`created_by`),
  CONSTRAINT `subscriptions_user_id_fkey` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `subscriptions_created_by_fkey` FOREIGN KEY (`created_by`)
    REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------- برامج الأعضاء ----------------------
CREATE TABLE IF NOT EXISTS `member_programs` (
  `id`         INT NOT NULL AUTO_INCREMENT,
  `user_id`    INT NOT NULL,
  `title`      VARCHAR(200) NOT NULL,
  `file_url`   VARCHAR(500) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `member_programs_user_id_idx` (`user_id`),
  CONSTRAINT `member_programs_user_id_fkey` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
