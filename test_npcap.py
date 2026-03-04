import sys
try:
    from nfstream import NFStreamer
    print("SUCCESS: NFStreamer imported successfully. Npcap DLLs loaded fine.")
except Exception as e:
    print(f"ERROR: Failed to load NFStreamer or Npcap: {e}")
