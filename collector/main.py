import time
import json
import db
import random
from datetime import datetime, timedelta

# Try to import NFStream, fallback to mock if it fails (Windows Npcap issue)
try:
    from nfstream import NFStreamer
    NFSTREAM_AVAILABLE = True
except ImportError:
    NFSTREAM_AVAILABLE = False

APPS = ["YouTube", "Google", "WhatsApp", "Microsoft Teams", "Zoom", "Office365", "Facebook", "Netflix", "Unknown", "Slack"]
CATEGORIES = ["Streaming", "Web", "Messaging", "Conference", "Conference", "Productivity", "Social", "Streaming", "Uncategorized", "Productivity"]
PROTOCOLS = ["TCP", "UDP"]
EMPLOYEES = [
    {"ip": "192.168.1.10", "name": "Alice"},
    {"ip": "192.168.1.11", "name": "Bob"},
    {"ip": "192.168.1.12", "name": "Charlie"},
    {"ip": "192.168.1.13", "name": "Diana"},
]

def generate_mock_flows():
    flows = []
    now = datetime.now()
    
    for _ in range(random.randint(2, 6)):
        app_idx = random.randint(0, len(APPS)-1)
        emp = random.choice(EMPLOYEES)
        
        flows.append({
            "src_ip": emp["ip"],
            "dst_ip": f"104.{random.randint(10,200)}.{random.randint(1,200)}.{random.randint(1,200)}",
            "src_port": random.randint(40000, 65000),
            "dst_port": random.choice([80, 443, 8080]),
            "protocol": random.choice(PROTOCOLS),
            "application_name": APPS[app_idx],
            "application_category": CATEGORIES[app_idx],
            "bytes_sent": random.randint(100, 500000),
            "bytes_received": random.randint(100, 500000),
            "first_seen": now - timedelta(seconds=random.randint(1, 10)),
            "last_seen": now,
            "flow_duration": random.randint(10, 5000)
        })
    return flows

def run_mock_collector():
    print("=====================================================")
    print("WARNING: NFStream is not available (Missing Npcap).")
    print("Running mock background flow generator instead...")
    print("=====================================================")
    try:
        while True:
            flows = generate_mock_flows()
            db.insert_flows(flows)
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Inserted {len(flows)} mock flows.")
            time.sleep(3)
    except KeyboardInterrupt:
        print("Mock collector stopped.")

def get_windows_npcap_interface(friendly_name="Wi-Fi"):
    import platform, subprocess
    if platform.system() == "Windows":
        try:
            cmd = f'powershell -Command "Get-NetAdapter -Name \'{friendly_name}\' | Select-Object -ExpandProperty InterfaceGuid"'
            guid = subprocess.check_output(cmd, shell=True, text=True).strip()
            if guid.startswith("{") and guid.endswith("}"):
                return rf"\Device\NPF_{guid}"
        except Exception:
            pass
    return friendly_name

def run_real_collector():
    iface = get_windows_npcap_interface("Wi-Fi")
    print(f"Starting REAL NFStream Capture on '{iface}'...")
    try:
        # n_meters=1 prevents Windows multiprocessing spawn crashes
        streamer = NFStreamer(source=iface, n_meters=1)
        flows_batch = []
        batch_size = 1
        
        for flow in streamer:
            if flow.protocol not in [6, 17] or flow.src2dst_bytes < 100:
                continue

            flows_batch.append({
                "src_ip": flow.src_ip,
                "dst_ip": flow.dst_ip,
                "src_port": flow.src_port,
                "dst_port": flow.dst_port,
                "protocol": "TCP" if flow.protocol == 6 else "UDP",
                "application_name": flow.application_name,
                "application_category": getattr(flow, "application_category_name", "Unknown"),
                "bytes_sent": flow.src2dst_bytes,
                "bytes_received": flow.dst2src_bytes,
                "first_seen": datetime.fromtimestamp(flow.bidirectional_first_seen_ms / 1000),
                "last_seen": datetime.fromtimestamp(flow.bidirectional_last_seen_ms / 1000),
                "flow_duration": flow.bidirectional_duration_ms
            })
            
            if len(flows_batch) >= batch_size:
                db.insert_flows(flows_batch)
                flows_batch = []
                
        if flows_batch:
            db.insert_flows(flows_batch)

    except Exception as e:
        print(f"NFStream Error: {e}")

if __name__ == "__main__":
    if NFSTREAM_AVAILABLE:
        run_real_collector()
    else:
        run_mock_collector()
