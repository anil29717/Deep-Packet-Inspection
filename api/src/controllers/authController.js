const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Mock User DB for simplicity (in real app, use MySQL)
// The PRD didn't specify an admin user table, but we need auth.
const users = [
    {
        id: 1,
        username: 'admin',
        // 'password123'
        password: '$2a$10$wT/t/w9Z35y7Vl33wKkC5e.f75/F2.zF3n2Z/3.zF3.zF3.zF3.z' // Note this is just an example hash. We'll use a dynamic one to be safe below.
    }
];

// Re-hashing correctly for the mock admin user
const salt = bcrypt.genSaltSync(10);
users[0].password = bcrypt.hashSync('admin123', salt);

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = users.find(u => u.username === username);

        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign(
                { id: user.id, username: user.username },
                process.env.JWT_SECRET || 'fallback_secret',
                { expiresIn: '8h' }
            );

            res.json({
                token,
                user: { id: user.id, username: user.username }
            });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
