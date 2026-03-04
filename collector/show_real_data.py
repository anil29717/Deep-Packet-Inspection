import os
import sys
import argparse
import datetime
import logging
from colorama import init, Fore, Style, Back

# Suppress scapy warnings
logging.getLogger("scapy.runtime").setLevel(logging.ERROR)

from scapy.all import sniff, IP, IPv6, TCP, UDP, DNS, DNSQR, Raw, DHCP, BOOTP
from scapy.layers.llmnr import LLMNRQuery
from scapy.layers.netbios import NBNSQueryRequest

init(autoreset=True)

# File handler for saving output
OUTPUT_FILE = None

def write_out(text):
    """Print to console and optionally to file."""
    print(text)
    if OUTPUT_FILE:
        try:
            # Strip ANSI color codes for file writing
            import re
            ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')
            clean_text = ansi_escape.sub('', text)
            with open(OUTPUT_FILE, 'a', encoding='utf-8') as f:
                f.write(clean_text + "\n")
        except:
            pass

def generate_hexdump(data, length=16):
    """
    Generate a formatted HEX and ASCII dump with offsets.
    Format: 0000: 00 01 01 00 00 ...
    """
    if not data: return "", ""
    
    hex_lines = []
    ascii_chars = []
    
    for i in range(0, len(data), length):
        chunk = data[i:i+length]
        
        # Hex portion
        hex_vals = [f"{b:02x}" for b in chunk]
        hex_line = f"{i:04x}: " + " ".join(hex_vals)
        hex_lines.append(hex_line)
        
        # ASCII portion
        for b in chunk:
            if 32 <= b <= 126:
                ascii_chars.append(chr(b))
            else:
                ascii_chars.append(".")
                
    ascii_str = "".join(ascii_chars)
    return "\n".join(hex_lines), ascii_str

# ======================================================================
# Protocol Decoders
# ======================================================================

def decode_llmnr(packet, payload):
    if packet.haslayer(LLMNRQuery):
        try:
            qname = packet[LLMNRQuery].qname.decode('utf-8', errors='ignore')
            clean_name = qname.strip('.')
            return (
                f"Computer: \"{clean_name}\"",
                f"Computer \"{clean_name}\" is being looked up on network",
                "This is how Windows computers find each other by name (Link-Local Multicast Name Resolution)"
            )
        except:
            pass
    return None

def decode_dns(packet, payload):
    if packet.haslayer(DNS) and packet.haslayer(DNSQR):
        try:
            qname = packet[DNSQR].qname.decode('utf-8', errors='ignore')
            clean_name = qname.strip('.')
            return (
                f"Domain: {clean_name}",
                f"Resolving domain name: {clean_name}",
                "Translating human-readable website name into an IP address"
            )
        except:
            pass
    return None

def decode_http(packet, payload):
    # Very basic HTTP payload detection
    try:
        lower_payload = payload.lower()
        if lower_payload.startswith(b"get ") or lower_payload.startswith(b"post ") or lower_payload.startswith(b"http/"):
            lines = payload.split(b'\r\n')
            req_line = lines[0].decode('utf-8', errors='ignore')
            
            headers = {}
            for line in lines[1:]:
                if not line: break
                try:
                    k, v = line.split(b': ', 1)
                    headers[k.lower()] = v
                except:
                    pass
            
            host = headers.get(b'host', b'').decode('utf-8', errors='ignore')
            ua = headers.get(b'user-agent', b'Unknown').decode('utf-8', errors='ignore')
            
            dec_text = f"URL: {host}\n→ User-Agent: {ua[:50]}..."
            expl = f"App is making an unencrypted Web Request: {req_line}"
            insight = "Plain-text web traffic detected. Content and URLs are fully visible."
            return (dec_text, expl, insight)
    except:
        pass
    return None

def decode_tls(packet, payload):
    try:
        if len(payload) > 43 and payload[0] == 0x16 and payload[5] == 0x01:
            import re
            matches = re.findall(b'([a-z0-9.-]+\.[a-z]{2,})', payload[40:200])
            for m in set(matches):
                if len(m) > 4 and b'.' in m:
                    domain = m.decode('utf-8')
                    return (
                        f"Target Server (SNI): {domain}",
                        f"Establishing secure connection to {domain}",
                        "TLS encrypts the payload, but the target domain name is exposed during handshake."
                    )
    except:
        pass
    return None

def decode_dhcp(packet, payload):
    if packet.haslayer(DHCP):
        try:
            options = packet[DHCP].options
            hostname = "Unknown"
            req_ip = "Unknown"
            for opt in options:
                if isinstance(opt, tuple):
                    if opt[0] == 'hostname': hostname = opt[1].decode('utf-8', errors='ignore')
                    if opt[0] == 'requested_addr': req_ip = opt[1]
                    
            if hostname != "Unknown" or req_ip != "Unknown":
                return (
                    f"Hostname: {hostname} | Req IP: {req_ip}",
                    f"Device '{hostname}' is requesting network configuration",
                    "Device is joining the network and asking the router for an IP address."
                )
        except:
            pass
    return None

def decode_netbios(packet, payload):
    if packet.haslayer(NBNSQueryRequest):
        try:
            qname = packet[NBNSQueryRequest].QUESTION_NAME.decode('utf-8', errors='ignore').strip()
            # NetBIOS names are often padded with spaces (0x20)
            return (
                f"NetBIOS Name: {qname}",
                f"Searching for legacy Windows machine/share: {qname}",
                "Legacy Windows naming protocol (NetBIOS) broadcasting for a local device."
            )
        except:
            pass
    return None

# ======================================================================
# Packet Processor
# ======================================================================

def process_packet(packet, args):
    try:
        if not (packet.haslayer(IP) or packet.haslayer(IPv6)):
            return
            
        src_ip = packet[IP].src if packet.haslayer(IP) else packet[IPv6].src
        dst_ip = packet[IP].dst if packet.haslayer(IP) else packet[IPv6].dst
        protocol = "Unknown"
        src_port, dst_port = 0, 0
        
        payload = b""
        if packet.haslayer(TCP):
            protocol = "TCP"
            src_port = packet[TCP].sport
            dst_port = packet[TCP].dport
            if packet.haslayer(Raw): payload = bytes(packet[Raw].load)
        elif packet.haslayer(UDP):
            protocol = "UDP"
            src_port = packet[UDP].sport
            dst_port = packet[UDP].dport
            if packet.haslayer(Raw): payload = bytes(packet[Raw].load)
            
        if not payload and not packet.haslayer(DNS) and not packet.haslayer(LLMNRQuery):
            return # Skip empty packets unless they are protocol headers we parse
            
        app_name = "Unknown"
        decoded_result = None
        
        # Apply decoders based on heuristics / ports
        if packet.haslayer(LLMNRQuery):
            app_name = "LLMNR"
            decoded_result = decode_llmnr(packet, payload)
        elif packet.haslayer(DNS):
            app_name = "DNS"
            decoded_result = decode_dns(packet, payload)
        elif packet.haslayer(NBNSQueryRequest) or dst_port == 137:
            app_name = "NetBIOS"
            decoded_result = decode_netbios(packet, payload)
        elif dst_port in (67, 68) or src_port in (67, 68):
            app_name = "DHCP"
            decoded_result = decode_dhcp(packet, payload)
        elif dst_port == 80 or src_port == 80 or b"HTTP/" in payload:
            app_name = "HTTP"
            decoded_result = decode_http(packet, payload)
        elif dst_port == 443 or src_port == 443:
            app_name = "HTTPS/TLS"
            decoded_result = decode_tls(packet, payload)
            
        # If no targeted decoding matched but we still need to show generic payload
        if not decoded_result and payload:
             decoded_result = (
                 "Raw Binary Data",
                 "Unrecognized application payload",
                 "Custom application or encrypted streaming data that doesn't match standard plaintext rules."
             )

        # Filtering logic
        if args.llmnr and app_name != "LLMNR": return
        if args.dns and app_name != "DNS": return
        if args.http and app_name != "HTTP": return
        if args.tls and app_name != "HTTPS/TLS": return
        if args.dhcp and app_name != "DHCP": return
        
        # If we have nothing to show and filters are on, skip
        if not decoded_result: return

        # Format output
        timestamp = datetime.datetime.now().strftime('%H:%M:%S.%f')[:-3]
        payload_size = len(payload)
        
        dec_data, dec_expl, insight = decoded_result
        
        output = []
        output.append(f"{Style.BRIGHT}{Fore.BLUE}{'='*64}")
        output.append(f"🔍 DEEP PACKET INSPECTION - [{timestamp}]")
        output.append(f"{Fore.BLUE}{'='*64}{Fore.RESET}")
        
        output.append(f"📋 Flow: [{protocol}] {Fore.GREEN}{src_ip}:{src_port}{Fore.RESET} -> {Fore.YELLOW}{dst_ip}:{dst_port}{Fore.RESET}")
        output.append(f"Detected App: {Style.BRIGHT}{app_name}{Style.RESET_ALL}\n")
        
        # Add Payload Visualization if it exists
        if payload:
            hex_display, ascii_display = generate_hexdump(payload[:96]) # limit length for readability
            output.append(f"📦 RAW PAYLOAD ({payload_size} bytes):")
            output.append(f"RAW HEX:\n{Fore.LIGHTBLACK_EX}{hex_display}{Fore.RESET}\n")
            output.append(f"ASCII: {Fore.WHITE}{ascii_display}{Fore.RESET}\n")
            
        # Decoded block
        output.append(f"🔓 DECODED INFORMATION:")
        output.append(f"{Fore.CYAN}→ {dec_data}{Fore.RESET}")
        output.append(f"{Fore.CYAN}→ {dec_expl}{Fore.RESET}\n")
        
        output.append(f"💡 INSIGHT: {Style.BRIGHT}{insight}{Style.RESET_ALL}")
        output.append(f"{Fore.BLUE}{'='*64}{Fore.RESET}\n")
        write_out("\n".join(output))
        
        try:
            import db
            h_disp, a_disp = "", ""
            if payload:
                h_disp, a_disp = generate_hexdump(payload[:96])
            db.insert_deep_packet({
                'protocol': app_name, 'src_ip': src_ip, 'src_port': src_port,
                'dst_ip': dst_ip, 'dst_port': dst_port, 'payload_size': payload_size,
                'hex_dump': h_disp, 'ascii_dump': a_disp,
                'decoded_data': dec_data, 'decoded_explanation': dec_expl, 'insight': insight
            })
        except Exception as db_e:
            print(f"DB Insert Error: {db_e}")
        
    except Exception as e:
        pass

def main():
    parser = argparse.ArgumentParser(description="Actual Packet Payloads Viewer")
    parser.add_argument("--llmnr", action="store_true", help="Filter strictly to LLMNR queries")
    parser.add_argument("--dns", action="store_true", help="Filter strictly to DNS queries")
    parser.add_argument("--http", action="store_true", help="Filter strictly to HTTP payloads")
    parser.add_argument("--tls", action="store_true", help="Filter strictly to TLS Handshake SNIs")
    parser.add_argument("--dhcp", action="store_true", help="Filter strictly to DHCP")
    parser.add_argument("--output", type=str, help="Save output to file (e.g. capture.log)")
    args = parser.parse_args()

    # Setup File output
    if args.output:
        global OUTPUT_FILE
        OUTPUT_FILE = args.output
        write_out(f"--- Capture Started at {datetime.datetime.now()} ---")

    os.system('cls' if os.name == 'nt' else 'clear')
    filter_msg = []
    if args.llmnr: filter_msg.append("LLMNR")
    if args.dns: filter_msg.append("DNS")
    if args.http: filter_msg.append("HTTP")
    if args.tls: filter_msg.append("TLS")
    if args.dhcp: filter_msg.append("DHCP")
    f_str = f" - Showing {', '.join(filter_msg)} only" if filter_msg else ""
    
    print(f"{Back.CYAN}{Fore.BLACK}{Style.BRIGHT} 🚀 Deep Packet Inspector{f_str} {' '*10}{Style.RESET_ALL}")
    print(f"Press Ctrl+C to stop\n")

    try:
        sniff(prn=lambda pkt: process_packet(pkt, args), store=False)
    except KeyboardInterrupt:
        print(f"\n{Fore.RED}🛑 Capture stopped cleanly by user.{Fore.RESET}")
    except PermissionError:
        print(f"\n{Fore.RED}❌ Permission Denied. You MUST run this script directly as an Administrator.{Fore.RESET}")
    except Exception as e:
        print(f"\n{Fore.RED}❌ Error starting capture: {e}{Fore.RESET}")

if __name__ == '__main__':
    main()
