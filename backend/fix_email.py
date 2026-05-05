import asyncio
import asyncpg


async def fix():
    conn = await asyncpg.connect(
        host="aws-1-ap-south-1.pooler.supabase.com",
        port=6543,
        user="postgres.zexvspvicchdyvefsubn",
        password="Tanzeel@Database01",
        database="postgres",
        statement_cache_size=0,
    )

    # Check what email is stored
    rows = await conn.fetch("SELECT id, email, role FROM users WHERE role = 'admin'")
    print("Current admin users:")
    for row in rows:
        print(f"  ID: {row['id']}  Email: {row['email']}")

    # Update to lowercase
    result = await conn.execute(
        "UPDATE users SET email = 'admin@clinismile.ai' WHERE email = 'admin@cliniSmile.ai'"
    )
    print(f"\nUpdate result: {result}")

    # Verify
    rows = await conn.fetch("SELECT email FROM users WHERE role = 'admin'")
    print("Admin email after fix:")
    for row in rows:
        print(f"  {row['email']}")

    await conn.close()
    print("\n✅ Done!")


asyncio.run(fix())