"""
Create Admin Account - Simple Method
====================================
"""
import urllib.request
import urllib.parse
import json

# Backend API endpoint
API_URL = "http://localhost:8000/api/v1/auth/register/patient"

payload = {
    "full_name": "CliniSmile Admin",
    "email": "admin@cliniSmile.ai",
    "phone": "+92-000-0000000",
    "password": "Admin@123456"
}

print("🔑 Creating Admin Account via Backend API...\n")

try:
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        API_URL,
        data=data,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    
    with urllib.request.urlopen(req, timeout=10) as response:
        result = json.loads(response.read())
        print("✅ Account registered successfully!")
        print(f"   Response Code: {response.status}")
        
except urllib.error.HTTPError as e:
    if e.code == 409:
        print("✅ Account already exists!")
    else:
        print(f"❌ Error: {e.code}")
        print(f"   {e.read().decode()}")
except urllib.error.URLError as e:
    print("❌ Cannot connect to backend!")
    print("   Make sure backend is running: http://localhost:8000")
except Exception as e:
    print(f"❌ Error: {str(e)}")

print("\n" + "="*60)
print("📝 IMPORTANT NEXT STEP:")
print("="*60)
print("\nYou need to update the user role in database:")
print("Use Supabase console or any SQL client:")
print("\nSQL Query to run:")
print("  UPDATE users SET role='admin' WHERE email='admin@cliniSmile.ai';")
print("\nThen login with:")
print("  Email:    admin@cliniSmile.ai")
print("  Password: Admin@123456")
print("="*60 + "\n")
