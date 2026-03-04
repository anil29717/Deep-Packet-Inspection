const cron = require('node-cron');
const pool = require('../config/db');

// Run every night at midnight
cron.schedule('0 0 * * *', async () => {
    console.log('Running daily aggregation job...');
    try {
        const query = `
            INSERT INTO daily_app_stats (stats_date, application_name, total_bytes, flow_count, unique_app_ip_count)
            SELECT 
                CURDATE() - INTERVAL 1 DAY as stats_date,
                application_name,
                SUM(total_bytes) as total_bytes,
                COUNT(id) as flow_count,
                COUNT(DISTINCT src_ip) as unique_app_ip_count
            FROM network_flows
            WHERE last_seen >= CURDATE() - INTERVAL 1 DAY
              AND last_seen < CURDATE()
            GROUP BY application_name
            ON DUPLICATE KEY UPDATE 
                total_bytes = VALUES(total_bytes),
                flow_count = VALUES(flow_count),
                unique_app_ip_count = VALUES(unique_app_ip_count);
        `;

        const [result] = await pool.query(query);
        console.log(`Daily aggregation completed. Rows affected: ${result.affectedRows}`);
    } catch (error) {
        console.error('Error running daily aggregation job:', error);
    }
});
