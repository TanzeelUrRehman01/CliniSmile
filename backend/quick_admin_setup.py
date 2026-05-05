"""
Quick Admin Creation via API Call
==================================
Since the backend is running and connected, we can register as a patient first
and then manually update the role in the database.
"""
import requests
import json

# Backend API endpoint
API_URL = "http://localhost:8000/api/v1"

def create_admin():
    print("🔑 Creating Admin Account via Backend...\n")
    
    # Step 1: Register as patient
    print("Step 1: Registering admin as patient...")
    payload = {
        "full_name": "CliniSmile Admin",
        "email": "admin@cliniSmile.ai",
        "phone": "+92-000-0000000",
        "password": "Admin@123456"
    }
    
    try:
        response = requests.post(
            f"{API_URL}/auth/register/patient",
            json=payload,
            timeout=10
        )
        
        if response.status_code in [201, 200]:
            print("✅ Account registered successfully!")
            print(f"   Response: {response.status_code}")
            print("\n⚠️  NEXT STEP: Use your database client (pgAdmin, DBeaver, etc.) to:")
            print("   1. Connect to: aws-1-ap-south-1.pooler.supabase.com:6543")
            print("   2. Run this SQL query:")
            print("\n   UPDATE users SET role='admin' WHERE email='admin@cliniSmile.ai';")
            print("\n   Then you can login with:")
            print("   - Email: admin@cliniSmile.ai")
            print("   - Password: Admin@123456")
            return True
        elif response.status_code == 409:
            print("✅ Admin account already exists!")
            print("   Just update the role in database if needed:")
            print("\n   UPDATE users SET role='admin' WHERE email='admin@cliniSmile.ai';")
            return True
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend!")
        print("   Make sure backend is running on http://localhost:8000")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    create_admin()
