
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100),
  email VARCHAR(150) UNIQUE,
  password_hash VARCHAR(255),
  rol ENUM('admin','vendedor','cliente'),
  estado BOOLEAN DEFAULT 1
);
