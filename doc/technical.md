# Technical Requirements - Master List

## Hardware Requirements
**Development Machine:**
- CPU: 4+ cores
- RAM: 8GB minimum, 16GB recommended
- Storage: 50GB free space
- Network: Access to office network (for testing)

**Production Server (Office):**
- CPU: 4+ cores (8 recommended)
- RAM: 16GB minimum
- Storage: 100GB SSD
- Network: Connected to SPAN/mirror port
- OS: Ubuntu 20.04/22.04 LTS

## Software Requirements

### Python Environment
- **OS:** Linux/Ubuntu (recommended), macOS, or Windows WSL2
- **Python:** 3.9 - 3.11
- **Libraries:** nfstream==6.5.3, pandas==2.0.0, mysql-connector-python==8.1.0, requests==2.31.0, python-dotenv==1.0.0, schedule==1.2.0, psutil==5.9.5, loguru==0.7.2

### Node.js Backend
- **Node.js:** 18.x or 20.x LTS
- **npm:** 9.x or higher
- **Dependencies:** express@4.18.2, mysql2@3.6.0, cors@2.8.5, helmet@7.0.0, express-rate-limit@6.9.0, jsonwebtoken@9.0.2, multer@1.4.5, ws@8.13.0, node-cron@3.0.2, winston@3.10.0, dotenv@16.3.1

### React Frontend
- **Node.js:** 18.x or 20.x LTS
- **npm:** 9.x or higher
- **Dependencies:** react@18.2.0, react-dom@18.2.0, react-router-dom@6.14.2, axios@1.4.0, recharts@2.7.2, @mui/material@5.14.0, @emotion/react@11.11.1, date-fns@2.30.0, socket.io-client@4.6.2, xlsx@0.18.5
- **Dev Dependencies:** vite@4.4.0, @vitejs/plugin-react@4.0.0, eslint@8.45.0

## Database Requirements
**MySQL:** 8.0 or higher
- **Configuration:** innodb_buffer_pool_size=4G, max_connections=200, log_bin=ON
- **Storage Planning:** ~60GB total for 30 days retention with indexes

## Network Requirements
- **Placement:** SPAN/Mirror Port (Recommended), Gateway/Proxy Mode, Tap Device
- **Interfaces:** 1Gbps NIC minimum, promiscuous mode, static IP

## Security Requirements
- **Firewall:** Localhost for MySQL, office network for API
- **Auth:** JWT, role-based, timeouts
- **Encryption:** HTTPS, passwords hashed with bcrypt

## Monitoring Requirements
- **Health Tracking:** CPU (<70%), Mem (<80%), API Response (<200ms)
- **Alerting:** High bandwidth usage, database disk alerts 

## Backup Requirements
- **Schedule:** Daily full backup at 2AM
- **Retention:** 30 days
- **RTO/RPO:** 4h / 24h
