const pool = require('../config/db');

exports.getProtocolPackets = async (req, res) => {
    try {
        const protocol = req.params.protocol; // e.g., 'dns', 'http', 'tls'
        let limit = parseInt(req.query.limit) || 50;

        // Use a wildcard match for complex ones like HTTPS/TLS
        const [rows] = await pool.query(`
            SELECT * FROM deep_packet_logs 
            WHERE protocol LIKE ? 
            ORDER BY timestamp DESC
            LIMIT ?
        `, [`%${protocol}%`, limit]);

        res.json(rows);
    } catch (error) {
        console.error('Error fetching deep packet logs:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getRecentPackets = async (req, res) => {
    try {
        let limit = parseInt(req.query.limit) || 100;

        const [rows] = await pool.query(`
            SELECT * FROM deep_packet_logs 
            ORDER BY timestamp DESC
            LIMIT ?
        `, [limit]);

        res.json(rows);
    } catch (error) {
        console.error('Error fetching recent deep packets:', error);
        res.status(500).json({ error: error.message });
    }
}
