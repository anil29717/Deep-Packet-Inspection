from nfstream import NFStreamer
import os
import time
import socket

try:
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect(('8.8.8.8', 80))
    ip = s.getsockname()[0]
    s.close()
    
    # Try capturing 2 packets to quickly inspect the fields
    print("Collecting 2 packets to see nfstream properties...")
    streamer = NFStreamer(source="Wi-Fi", statistic='short')
    
    count = 0
    for flow in streamer:
        print("\n=== Valid NFlow Properties ===")
        for prop in dir(flow):
            if not prop.startswith("_"):
                print(f"- {prop}")
        break  # Just need to check the First Flow
        
except Exception as e:
    print(f"Error: {e}")
