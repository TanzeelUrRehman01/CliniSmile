"""
Create Admin - Direct SQL Approach
===================================
This creates an admin by directly inserting into the database with a pre-hashed password.
The password hash is for: Admin@123456
"""

# Pre-hashed password for "Admin@123456"
ADMIN_HASH = "$2b$12$R9h7cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss8KKUgO2Jy5a44W"

SQL_QUERY = f"""
-- Delete any existing admin
DELETE FROM users WHERE email = 'admin@cliniSmile.ai';

-- Insert admin user
INSERT INTO users (
    email, 
    password_hash, 
    role, 
    full_name, 
    phone, 
    is_active, 
    email_verified,
    created_at,
    updated_at
) VALUES (
    'admin@cliniSmile.ai',
    '{ADMIN_HASH}',
    'admin',
    'CliniSmile Admin',
    '+92-000-0000000',
    true,
    true,
    NOW(),
    NOW()
);
"""

print("""
╔════════════════════════════════════════════════════════════════╗
║        ADMIN ACCOUNT CREATION - SUPABASE SQL QUERY              ║
╚════════════════════════════════════════════════════════════════╝

📋 INSTRUCTIONS:
1. Go to: https://app.supabase.com
2. Select your project
3. Click "SQL Editor" in the sidebar
4. Click "New query"
5. Copy-paste the SQL below
6. Click "Run"
7. Login with the credentials below

═══════════════════════════════════════════════════════════════════
""")

print(SQL_QUERY)

print("""
═══════════════════════════════════════════════════════════════════

✅ LOGIN CREDENTIALS (after running SQL):
   Email:    admin@cliniSmile.ai
   Password: Admin@123456

🌐 Login URL: http://localhost:5173/login

═══════════════════════════════════════════════════════════════════
""")
