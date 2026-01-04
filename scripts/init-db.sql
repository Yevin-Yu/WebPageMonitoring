-- Create database if not exists
CREATE DATABASE IF NOT EXISTS web_monitoring CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE web_monitoring;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  avatar VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  `key` VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  website VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  user_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_key (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Page visits table
CREATE TABLE IF NOT EXISTS page_visits (
  id VARCHAR(36) PRIMARY KEY,
  project_id VARCHAR(36) NOT NULL,
  session_id VARCHAR(255) NOT NULL,
  page_url TEXT NOT NULL,
  page_title VARCHAR(500),
  referrer TEXT,
  user_agent TEXT,
  screen_info JSON,
  browser_info JSON,
  os_info JSON,
  visit_date DATE NOT NULL,
  visit_time TIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_project_date (project_id, visit_date),
  INDEX idx_project_session (project_id, session_id),
  INDEX idx_session_id (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Performance metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
  id VARCHAR(36) PRIMARY KEY,
  project_id VARCHAR(36) NOT NULL,
  session_id VARCHAR(255) NOT NULL,
  page_url TEXT NOT NULL,
  page_load_time FLOAT,
  dom_content_loaded_time FLOAT,
  first_paint FLOAT,
  first_contentful_paint FLOAT,
  resource_count INT,
  error_count INT,
  resources JSON,
  errors JSON,
  metric_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_project_date (project_id, metric_date),
  INDEX idx_session_id (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Daily stats table
CREATE TABLE IF NOT EXISTS daily_stats (
  id VARCHAR(36) PRIMARY KEY,
  project_id VARCHAR(36) NOT NULL,
  stat_date DATE NOT NULL,
  page_views INT DEFAULT 0,
  unique_visitors INT DEFAULT 0,
  sessions INT DEFAULT 0,
  avg_page_load_time FLOAT DEFAULT 0,
  avg_dom_content_loaded_time FLOAT DEFAULT 0,
  bounce_rate INT DEFAULT 0,
  top_pages JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at DATE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  UNIQUE KEY unique_project_date (project_id, stat_date),
  INDEX idx_stat_date (stat_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
