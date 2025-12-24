-- Create requests table with UTF-8 support for Arabic text
CREATE TABLE IF NOT EXISTS requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  requestNumber VARCHAR(50) NOT NULL UNIQUE,
  paymentType VARCHAR(50) NOT NULL,
  requesterName VARCHAR(255) NOT NULL,
  jobTitle VARCHAR(255) NOT NULL,
  department VARCHAR(100) NOT NULL,
  approverDepartment VARCHAR(100) NOT NULL,
  amountInNumbers DECIMAL(12, 2) NOT NULL,
  amountInWords TEXT NOT NULL,
  status VARCHAR(50) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_requestNumber (requestNumber),
  INDEX idx_department (department),
  INDEX idx_status (status),
  INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
