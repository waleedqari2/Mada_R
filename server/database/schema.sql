-- Database Schema for Mada Request Management System
-- This schema includes all necessary tables with proper relationships and indexes

-- Users table for authentication
CREATE TABLE IF NOT EXISTS Users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role ENUM('admin', 'manager', 'user') DEFAULT 'user',
  department VARCHAR(100),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  is_active BOOLEAN DEFAULT TRUE,
  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_department (department)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Requests table for expense requests
CREATE TABLE IF NOT EXISTS Requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  request_number VARCHAR(50) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  department VARCHAR(100) NOT NULL,
  beneficiary VARCHAR(100) NOT NULL,
  request_date DATE NOT NULL,
  description TEXT,
  total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
  approved_by INT NULL,
  approved_at TIMESTAMP NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES Users(id) ON DELETE SET NULL,
  INDEX idx_request_number (request_number),
  INDEX idx_user_id (user_id),
  INDEX idx_department (department),
  INDEX idx_status (status),
  INDEX idx_request_date (request_date),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Request Items table for individual expense items
CREATE TABLE IF NOT EXISTS RequestItems (
  id INT PRIMARY KEY AUTO_INCREMENT,
  request_id INT NOT NULL,
  item_number INT NOT NULL,
  description TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(15, 2) NOT NULL,
  total_price DECIMAL(15, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES Requests(id) ON DELETE CASCADE,
  INDEX idx_request_id (request_id),
  INDEX idx_item_number (item_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit Log table for tracking changes
CREATE TABLE IF NOT EXISTS AuditLog (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications table
CREATE TABLE IF NOT EXISTS Notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  related_entity_type VARCHAR(50),
  related_entity_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user (password: admin123)
INSERT INTO Users (username, email, password, full_name, role, department)
VALUES (
  'admin',
  'admin@mada.sa',
  '$2a$10$rQJ5WfJKZKGGKZKzC3zXxOXZYJ7KqYGKzJ5WfJKZKGGKZKzC3zXxO',
  'مدير النظام',
  'admin',
  'الإدارة العامة'
) ON DUPLICATE KEY UPDATE id=id;

-- Insert sample users for testing
INSERT INTO Users (username, email, password, full_name, role, department)
VALUES 
  ('manager1', 'manager@mada.sa', '$2a$10$rQJ5WfJKZKGGKZKzC3zXxOXZYJ7KqYGKzJ5WfJKZKGGKZKzC3zXxO', 'محمد المدير', 'manager', 'المالية'),
  ('user1', 'user@mada.sa', '$2a$10$rQJ5WfJKZKGGKZKzC3zXxOXZYJ7KqYGKzJ5WfJKZKGGKZKzC3zXxO', 'أحمد الموظف', 'user', 'الموارد البشرية')
ON DUPLICATE KEY UPDATE id=id;
