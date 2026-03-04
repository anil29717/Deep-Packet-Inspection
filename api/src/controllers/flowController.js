const pool = require('../config/db');

// Get recent flows
exports.getLatestFlows = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const [rows] = await pool.query(`
            SELECT id, src_ip, dst_ip, src_port, dst_port, protocol, 
                   application_name, application_category, total_bytes, last_seen, flow_duration
            FROM network_flows 
            ORDER BY last_seen DESC
            LIMIT ?
        `, [limit]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching latest flows:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get flows with search filters
exports.searchFlows = async (req, res) => {
    try {
        const { app, ip, protocol } = req.query;
        let query = `
            SELECT id, src_ip, dst_ip, src_port, dst_port, protocol, 
                   application_name, application_category, total_bytes, last_seen 
            FROM network_flows WHERE 1=1
        `;
        const params = [];

        if (app) {
            query += ` AND application_name LIKE ?`;
            params.push(`%${app}%`);
        }
        if (ip) {
            query += ` AND (src_ip = ? OR dst_ip = ?)`;
            params.push(ip, ip);
        }
        if (protocol) {
            query += ` AND protocol = ?`;
            params.push(protocol);
        }

        query += ` ORDER BY last_seen DESC LIMIT 100`;

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Error searching flows:', error);
        res.status(500).json({ error: error.message });
    }
};
