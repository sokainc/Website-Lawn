CREATE TABLE `service_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`address` text NOT NULL,
	`city` text NOT NULL,
	`state` text NOT NULL,
	`postal_code` text NOT NULL,
	`lot_size` integer NOT NULL,
	`frequency` text NOT NULL,
	`grass_height` text NOT NULL,
	`gated` integer DEFAULT false NOT NULL,
	`add_ons` text DEFAULT '[]' NOT NULL,
	`price_cents` integer NOT NULL,
	`preferred_date` text,
	`notes` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `service_requests_reference_unique` ON `service_requests` (`reference`);
--> statement-breakpoint
CREATE INDEX `idx_service_requests_status_created_at` ON `service_requests` (`status`,`created_at`);
