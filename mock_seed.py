import mysql.connector
import random
from datetime import datetime, timedelta
import time
from dotenv import load_dotenv
import os

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "12345")
DB_NAME = os.getenv("DB_NAME", "office_dpi")

APPS = ["YouTube", "Google", "WhatsApp", "Microsoft Teams", "Zoom", "Office365", "Facebook", "Netflix", "Unknown", "Slack"]
CATEGORIES = ["Streaming", "Web", "Messaging", "Conference", "Conference", "Productivity", "Social", "Streaming", "Uncategorized", "Productivity"]
PROTOCOLS = ["TCP", "UDP"]
EMPLOYEES = [
    {"ip": "192.168.1.10", "name": "Alice"},
    {"ip": "192.168.1.11", "name": "Bob"},
    {"ip": "192.168.1.12", "name": "Charlie"},
    {"ip": "192.168.1.13", "name": "Diana"},
]

def seed_db():
    print(f"Connecting to MySQL at {DB_HOST}...")
    try:
        conn = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME
        )
        cursor = conn.cursor()

        print("Generating mock data...")
        now = datetime.now()
        flows = []
        for i in range(200):
            app_idx = random.randint(0, len(APPS)-1)
            emp = random.choice(EMPLOYEES)
            src_ip = emp["ip"]
            dst_ip = f"104.{random.randint(10,200)}.{random.randint(1,200)}.{random.randint(1,200)}"
            
            bytes_sent = random.randint(1000, 25000000)
            bytes_received = random.randint(1000, 25000000)
            first_seen = now - timedelta(minutes=random.randint(1, 60))
            last_seen = first_seen + timedelta(seconds=random.randint(1, 100))
            flow_duration = (last_seen - first_seen).total_seconds() * 1000

            flows.append((
                src_ip,
                dst_ip,
                random.randint(40000, 65000), # src_port
                random.choice([80, 443, 8080]), # dst_port
                random.choice(PROTOCOLS),
                APPS[app_idx],
                CATEGORIES[app_idx],
                bytes_sent,
                bytes_received,
                first_seen,
                last_seen,
                flow_duration
            ))

        query = """
            INSERT INTO network_flows 
            (src_ip, dst_ip, src_port, dst_port, protocol, application_name, application_category, bytes_sent, bytes_received, first_seen, last_seen, flow_duration)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.executemany(query, flows)
        conn.commit()
        print(f"Successfully inserted {len(flows)} mock flows into the database.")
        
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Database error: {e}")

if __name__ == "__main__":
    seed_db()
