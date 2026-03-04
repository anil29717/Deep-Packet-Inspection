import os
import json
from nfstream import NFStreamer

def test_pcap(pcap_file):
    if not os.path.exists(pcap_file):
        print(f"Error: {pcap_file} does not exist.")
        return

    print(f"Reading {pcap_file} with NFStream...")
    streamer = NFStreamer(source=pcap_file)
    flows = []

    for flow in streamer:
        flow_data = {
            "src_ip": flow.src_ip,
            "dst_ip": flow.dst_ip,
            "src_port": flow.src_port,
            "dst_port": flow.dst_port,
            "protocol": flow.protocol,
            "application_name": flow.application_name,
            "application_category": flow.application_category,
            "bytes_sent": flow.src2dst_bytes,
            "bytes_received": flow.dst2src_bytes,
            "flow_duration": flow.bidirectional_duration_ms
        }
        flows.append(flow_data)

    print(f"Extracted {len(flows)} flows.")
    
    # Save a sample to test JSON export
    with open('flows_test.json', 'w') as f:
        json.dump(flows[:10], f, indent=4)
        print("Exported first 10 flows to flows_test.json")

if __name__ == "__main__":
    test_pcap("http.cap")
