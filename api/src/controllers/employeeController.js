const pool = require('../config/db');
const fs = require('fs');

exports.getAllEmployees = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT e.*, GROUP_CONCAT(ei.ip_address SEPARATOR ', ') as mapped_ips 
            FROM employees e 
            LEFT JOIN employee_ips ei ON e.id = ei.employee_id 
            GROUP BY e.id
        `);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching employees:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.getEmployeeIps = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(`
            SELECT ip_address, device_name, device_type 
            FROM employee_ips 
            WHERE employee_id = ?
        `, [id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.uploadCSV = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Please upload a CSV file!' });
        }

        console.log(`Processing CSV file: ${req.file.path}`);

        const fileContent = fs.readFileSync(req.file.path, 'utf8');
        const lines = fileContent.split(/\r?\n/).filter(line => line.trim() !== '');

        let importedCount = 0;
        if (lines.length > 1) {
            for (let i = 1; i < lines.length; i++) {
                const cols = lines[i].split(',').map(c => c.trim());
                if (cols.length >= 4) {
                    const empId = cols[0];
                    const name = cols[1];
                    const dept = cols[2];
                    const ip = cols[3];

                    // Insert or Update employee
                    await pool.query(`
                        INSERT INTO employees (id, name, department, email)
                        VALUES (?, ?, ?, '')
                        ON DUPLICATE KEY UPDATE name = VALUES(name), department = VALUES(department)
                    `, [empId, name, dept]);

                    // Insert IP mapping mapping (IGNORE duplicates)
                    await pool.query(`
                        INSERT IGNORE INTO employee_ips (employee_id, ip_address)
                        VALUES (?, ?)
                    `, [empId, ip]);
                    importedCount++;
                }
            }
        }

        // Clean up temp file
        fs.unlinkSync(req.file.path);

        res.status(200).json({
            message: `Successfully mapped ${importedCount} employees and their IPs!`,
            imported: true
        });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ error: error.message });
    }
};
