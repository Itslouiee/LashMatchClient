-- MySQL 5.7+ / MariaDB 10.4+. Repeatable installation; preserves existing records.
CREATE DATABASE IF NOT EXISTS lashmatch CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lashmatch;
CREATE TABLE IF NOT EXISTS users (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(100) NOT NULL,
 email VARCHAR(254) NOT NULL UNIQUE,
 password_hash VARCHAR(255) NOT NULL,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS lash_styles (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(50) NOT NULL UNIQUE,
 description TEXT NOT NULL
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS studios (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 slug VARCHAR(100) NOT NULL UNIQUE,
 name VARCHAR(150) NOT NULL,
 city VARCHAR(100) NOT NULL,
 address VARCHAR(255) NOT NULL,
 description TEXT NOT NULL,
 specialties JSON NOT NULL,
 latitude DECIMAL(10,7) DEFAULT NULL,
 longitude DECIMAL(10,7) DEFAULT NULL,
 is_demo BOOLEAN NOT NULL DEFAULT TRUE,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 INDEX idx_studios_city (city)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS lash_matches (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 user_id BIGINT UNSIGNED NOT NULL,
 lash_style_id INT UNSIGNED NOT NULL,
 eye_shape ENUM('almond','round','hooded','monolid','unsure') NOT NULL,
 finish ENUM('natural','balanced','textured','dramatic') NOT NULL,
 occasion ENUM('everyday','event') NOT NULL,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT fk_matches_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
 CONSTRAINT fk_matches_style FOREIGN KEY (lash_style_id) REFERENCES lash_styles(id),
 INDEX idx_matches_user_date (user_id,created_at)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS auth_attempts (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 ip_hash CHAR(64) NOT NULL,
 attempted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 INDEX idx_auth_ip_date (ip_hash,attempted_at),
 INDEX idx_auth_date (attempted_at)
) ENGINE=InnoDB;
INSERT INTO lash_styles (name,description) VALUES
('Classic','Light definition with a natural everyday finish.'),
('Hybrid','A blend of definition and soft, textured fullness.'),
('Wispy','Airy texture with varying lengths and a fluttery finish.'),
('Volume','Fuller texture for an expressive statement look.')
ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO studios (slug,name,city,address,description,specialties,is_demo) VALUES
('demo-blush-bloom','Blush & Bloom Lash Studio','Makati','Sample listing · Salcedo Village, Makati','A calm, blush-toned space for soft, everyday lash looks.','["Classic","Hybrid"]',TRUE),
('demo-lash-edit','The Lash Edit','Quezon City','Sample listing · Diliman, Quezon City','Fluttery textures and a little extra personality for your lash routine.','["Wispy","Hybrid"]',TRUE),
('demo-petal-lounge','Petal Lash Lounge','Mandaluyong','Sample listing · Greenfield District, Mandaluyong','Expressive lash inspiration, from natural definition to fuller volume.','["Classic","Volume"]',TRUE)
ON DUPLICATE KEY UPDATE slug=VALUES(slug);
