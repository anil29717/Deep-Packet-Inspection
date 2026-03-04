const pool = require('../config/db');

// Get top applications by bandwidth
exports.getTopApps = async (req, res) => {
    const hours = parseInt(req.query.hours) || 24;
    try {
        const [rows] = await pool.query(`
            SELECT application_name, 
                   SUM(total_bytes) as total_bytes,
                   COUNT(DISTINCT src_ip) as unique_users
            FROM network_flows 
            WHERE last_seen > DATE_SUB(NOW(), INTERVAL ? HOUR)
            GROUP BY application_name
            ORDER BY total_bytes DESC
            LIMIT 10
        `, [hours]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching top apps:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get top talkers (IPs) by bandwidth
exports.getTopTalkers = async (req, res) => {
    const hours = parseInt(req.query.hours) || 24;
    try {
        const [rows] = await pool.query(`
            SELECT src_ip, 
                   SUM(total_bytes) as total_bytes,
                   COUNT(id) as flow_count
            FROM network_flows 
            WHERE last_seen > DATE_SUB(NOW(), INTERVAL ? HOUR)
            GROUP BY src_ip
            ORDER BY total_bytes DESC
            LIMIT 10
        `, [hours]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching top talkers:', error);
        res.status(500).json({ error: error.message });
    }
};
