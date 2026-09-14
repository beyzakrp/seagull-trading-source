ALTER TABLE `admins` ADD `role` text DEFAULT 'staff' NOT NULL;--> statement-breakpoint
ALTER TABLE `admins` ADD `business_id` integer REFERENCES businesses(id);