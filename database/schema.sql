-- Core flows table
CREATE DATABASE IF NOT EXISTS office_dpi;
USE office_dpi;

CREATE TABLE IF NOT EXISTS network_flows (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    src_ip VARCHAR(45) NOT NULL,
    dst_ip VARCHAR(45) NOT NULL,
    src_port INT,
    dst_port INT,
    protocol VARCHAR(10),
    application_name VARCHAR(100),
    application_category VARCHAR(50),
    bytes_sent BIGINT DEFAULT 0,
    bytes_received BIGINT DEFAULT 0,
    total_bytes BIGINT GENERATED ALWAYS AS (bytes_sent + bytes_received) STORED,
    first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP,
    flow_duration FLOAT,
    INDEX idx_app (application_name),
    INDEX idx_time (last_seen),
    INDEX idx_src_ip (src_ip),
    INDEX idx_total_bytes (total_bytes)
);

-- Aggregation table for daily stats
CREATE TABLE IF NOT EXISTS daily_app_stats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    stats_date DATE,
    application_name VARCHAR(100),
    total_bytes BIGINT,
    flow_count INT,
    unique_app_ip_count INT,
    UNIQUE KEY unique_daily (stats_date, application_name)
);

-- Configuration table
CREATE TABLE IF NOT EXISTS config (
    config_key VARCHAR(50) PRIMARY KEY,
    config_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Deep Packet Logs for UI Viewer
CREATE TABLE IF NOT EXISTS deep_packet_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    protocol VARCHAR(20),
    src_ip VARCHAR(45),
    src_port INT,
    dst_ip VARCHAR(45),
    dst_port INT,
    payload_size INT,
    hex_dump TEXT,
    ascii_dump TEXT,
    decoded_data TEXT,
    decoded_explanation TEXT,
    insight TEXT,
    INDEX idx_proto (protocol),
    INDEX idx_time (timestamp)
);

-- Insert default config
INSERT IGNORE INTO config (config_key, config_value) VALUES 
('retention_days', '30'),
('alert_threshold_mb', '500'),
('office_network', '192.168.1.0/24');

-- Employee Information
CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100),
    department VARCHAR(100),
    email VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS employee_ips (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(50),
    ip_address VARCHAR(45) UNIQUE,
    device_name VARCHAR(100) DEFAULT 'Unknown',
    device_type VARCHAR(50) DEFAULT 'Unknown',
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);
