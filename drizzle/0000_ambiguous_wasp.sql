CREATE TABLE `admins` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`password_salt` text NOT NULL,
	`password_iterations` integer NOT NULL,
	`password_algo` text DEFAULT 'pbkdf2-sha256' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admins_username_unique` ON `admins` (`username`);--> statement-breakpoint
CREATE TABLE `businesses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`location` text,
	`languages` text DEFAULT '["EN"]' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `businesses_slug_unique` ON `businesses` (`slug`);--> statement-breakpoint
CREATE TABLE `menu_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`business_id` integer NOT NULL,
	`name` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `menu_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`category_id` integer NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`price_minor` integer NOT NULL,
	`currency` text DEFAULT 'EUR' NOT NULL,
	`is_available` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `menu_categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `qr_codes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`number` text NOT NULL,
	`business_id` integer,
	`status` text DEFAULT 'unassigned' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`assigned_at` text,
	FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `qr_codes_number_unique` ON `qr_codes` (`number`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`admin_id` integer NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`admin_id`) REFERENCES `admins`(`id`) ON UPDATE no action ON DELETE no action
);
