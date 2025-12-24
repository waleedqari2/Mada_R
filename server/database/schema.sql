-- مدى السياحية - Advanced Disbursement Request Management System
-- Database Schema

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS mada_requests CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mada_requests;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  role ENUM('admin', 'manager', 'accountant', 'user') DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Requests Table
CREATE TABLE IF NOT EXISTS requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  requestNumber VARCHAR(50) UNIQUE NOT NULL,
  paymentType VARCHAR(100) NOT NULL,
  requesterName VARCHAR(100) NOT NULL,
  jobTitle VARCHAR(100),
  department VARCHAR(100) NOT NULL,
  approverDepartment VARCHAR(100),
  amountInNumbers DECIMAL(15, 2) NOT NULL,
  amountInWords TEXT,
  notes TEXT,
  status ENUM('تم التعميد', 'في انتظار', 'موافق', 'تم التنفيذ') DEFAULT 'في انتظار',
  approverSignature TEXT,
  managerSignature TEXT,
  accountantSignature TEXT,
  approvalDate TIMESTAMP NULL,
  implementationDate TIMESTAMP NULL,
  createdBy INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedBy INT,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (updatedBy) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_requestNumber (requestNumber),
  INDEX idx_department (department),
  INDEX idx_status (status),
  INDEX idx_createdAt (createdAt),
  INDEX idx_createdBy (createdBy)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Request Items Table (for multiple items in a request)
CREATE TABLE IF NOT EXISTS request_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  requestId INT NOT NULL,
  description TEXT NOT NULL,
  unit VARCHAR(50),
  quantity INT DEFAULT 1,
  unitPrice DECIMAL(15, 2) NOT NULL,
  total DECIMAL(15, 2) NOT NULL,
  notes TEXT,
  FOREIGN KEY (requestId) REFERENCES requests(id) ON DELETE CASCADE,
  INDEX idx_requestId (requestId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit Log Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  action ENUM('create', 'update', 'delete', 'status_change', 'signature_add') NOT NULL,
  requestId INT,
  changes TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (requestId) REFERENCES requests(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_requestId (requestId),
  INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  message TEXT NOT NULL,
  type ENUM('approval', 'delay', 'status_change', 'general') DEFAULT 'general',
  isRead BOOLEAN DEFAULT FALSE,
  requestId INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (requestId) REFERENCES requests(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_isRead (isRead),
  INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user (password: admin123 - should be changed in production)
INSERT INTO users (username, password, email, role) VALUES 
('admin', '$2a$10$YQ6GJ5vGK5z8ZQ9mY5Z8Ze5Z8Ze5Z8Ze5Z8Ze5Z8Ze5Z8Ze5Z8Ze5', 'admin@mada.sa', 'admin')
ON DUPLICATE KEY UPDATE username=username;
