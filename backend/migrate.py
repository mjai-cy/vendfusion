import os
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

# We'll import engine from database.py to reuse the SSL logic we just added
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from database import engine

def migrate():
    with engine.connect() as conn:
        print("Connected to database. Running ALTER TABLE queries...")
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;"))
            print("Added is_verified column.")
        except Exception as e:
            print(f"Skipping is_verified: {e}")

        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN verification_otp VARCHAR;"))
            print("Added verification_otp column.")
        except Exception as e:
            print(f"Skipping verification_otp: {e}")
            
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN reset_token VARCHAR;"))
            print("Added reset_token column.")
        except Exception as e:
            print(f"Skipping reset_token: {e}")
            
        conn.commit()
        print("Migration complete!")

if __name__ == "__main__":
    migrate()
