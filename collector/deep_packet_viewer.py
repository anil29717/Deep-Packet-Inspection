import os
import sys
import logging
from colorama import init, Fore, Style, Back

# Suppress scapy warnings
logging.getLogger("scapy.runtime").setLevel(logging.ERROR)

try:
    from scapy.all import sniff, conf, Ether, IP, TCP, UDP, DNS, DNSQR, Raw
    from scapy.layers.llmnr import LLMNRQuery
    from scapy.layers.http import HTTPRequest, HTTPResponse
except ImportError:
    print("Please ensure scapy is installed: pip install scapy")
    sys.exit(1)

init(autoreset=True)

def hexdump(src, length=16):
    """Generate a neat classic hex + ASCII dump for payloads."""
    if not src: return ""
    result = []
    for i in range(0, len(src), length):
        s = src[i:i+length]
        hexa = b' '.join([b"%02X" % x for x in s]) if isinstance(s, bytes) else ' '.join(["%02X" % ord(x) for x in s])
        text = b''.join([bytes([x]) if 0x20 <= x < 0x7F else b'.' for x in s]) if isinstance(s, bytes) else ''.join([x if 0x20 <= ord(x) < 0x7F else '.' for x in s])
        if isinstance(hexa, bytes): hexa = hexa.decode('utf-8', errors='ignore')
        if isinstance(text, bytes): text = text.decode('utf-8', errors='ignore')
        result.append(f"{i:04x}   {hexa:<{length*3}}   {text}")
    return '\n'.join(result)

def extract_sni(payload_bytes):
    """Attempt to extract SNI (Server Name Indication) from a TLS Client Hello."""
    # This is a very basic heuristic parser for TLS 1.0-1.2 Client Hello packets
    try:
        if len(payload_bytes) > 43 and payload_bytes[0] == 0x16 and payload_bytes[5] == 0x01:
            # TLS Handshake (0x16), Client Hello (0x01)
            import re
            # Look for common domain name patterns inside the payload
            matches = re.findall(b'([a-z0-9.-]+\.[a-z]{2,})', payload_bytes[40:200])
            for m in set(matches):
                if len(m) > 4 and b'.' in m:
                    return m.decode('utf-8')
    except Exception:
        pass
    return None

def extract_http(payload_bytes):
    """Attempt to extract HTTP Headers from raw payload."""
    try:
        if any(payload_bytes.startswith(m) for m in [b"GET ", b"POST ", b"PUT ", b"DELETE ", b"HTTP/"]):
            # Get the first two lines (Request Line + Host)
            lines = payload_bytes.split(b'\r\n')
            if len(lines) >= 2:
                req_line = lines[0].decode('utf-8', errors='ignore')
                headers = []
                for line in lines[1:]:
                    if line == b"": break
                    headers.append(line.decode('utf-8', errors='ignore'))
                return req_line, headers[:3] # Return request line + top 3 headers
    except:
        pass
    return None, []

def process_packet(packet):
    try:
        if not packet.haslayer(IP):
            return

        ip = packet[IP]
        src = ip.src
        dst = ip.dst
        
        # Check if the packet has a payload or specific application layers
        has_payload = packet.haslayer(Raw)
        payload_bytes = bytes(packet[Raw].load) if has_payload else b""
        
        # Determine protocol and deep details
        p_type = f"{Fore.YELLOW}Unknown{Fore.RESET}"
        deep_info = ""
        
        if packet.haslayer(LLMNRQuery):
            p_type = f"{Fore.MAGENTA}LLMNR Query{Fore.RESET}"
            qname = packet[LLMNRQuery].qname.decode('utf-8', errors='ignore') if getattr(packet[LLMNRQuery], 'qname', None) else "Unknown"
            deep_info = f"{Fore.MAGENTA}Computer/Service Looked Up: {qname}{Fore.RESET}"
            
        elif packet.haslayer(DNS) and packet.haslayer(DNSQR):
            p_type = f"{Fore.CYAN}DNS Query{Fore.RESET}"
            qname = packet[DNSQR].qname.decode('utf-8', errors='ignore') if getattr(packet[DNSQR], 'qname', None) else "Unknown"
            deep_info = f"{Fore.CYAN}Domain Looked Up: {qname}{Fore.RESET}"
            
        elif packet.haslayer(TCP):
            tcp = packet[TCP]
            p_type = f"{Fore.BLUE}TCP{Fore.RESET}"
            if tcp.dport == 80 or tcp.sport == 80:
                p_type = f"{Fore.GREEN}HTTP{Fore.RESET}"
                req_line, headers = extract_http(payload_bytes)
                if req_line:
                    deep_info += f"{Fore.GREEN}Request: {req_line}\n"
                    for h in headers:
                        deep_info += f"              Header:  {h}\n"
                    deep_info += f"{Fore.RESET}"
            
            elif tcp.dport == 443 or tcp.sport == 443:
                p_type = f"{Fore.CYAN}HTTPS/TLS{Fore.RESET}"
                sni = extract_sni(payload_bytes)
                if sni:
                    deep_info = f"{Fore.CYAN}TLS SNI Target Domain: {sni}{Fore.RESET}"
                
        elif packet.haslayer(UDP):
            p_type = f"{Fore.BLUE}UDP{Fore.RESET}"

        # Only display packets that have meaningful payload/data for this demonstration
        if not deep_info and not has_payload:
            return

        print(f"\n{Style.BRIGHT}{Back.BLUE}{Fore.WHITE} {'='*80} {Style.RESET_ALL}")
        print(f"{Fore.GREEN}▸ [Metadata]{Fore.RESET} {src} -> {dst} | Protocol: {p_type}")
        
        if deep_info:
            print(f"{Fore.YELLOW}▸ [Analyzed]{Fore.RESET} {deep_info.strip()}")
            
        if payload_bytes:
            print(f"{Fore.LIGHTBLACK_EX}▸ [Payload Hex] Length: {len(payload_bytes)} bytes{Fore.RESET}")
            hexa_dump = hexdump(payload_bytes[:128]) # Cut off at 128 bytes to not flood screen
            for line in hexa_dump.split('\n'):
                print(f"              {Fore.LIGHTBLACK_EX}{line}{Fore.RESET}")
            if len(payload_bytes) > 128:
                print(f"              {Fore.LIGHTBLACK_EX}... [Data Truncated] ...{Fore.RESET}")

    except Exception as e:
        print(f"Packet processing error: {e}")

def main():
    os.system('cls' if os.name == 'nt' else 'clear')
    print(f"{Back.MAGENTA}{Fore.WHITE}{Style.BRIGHT} 🔬 DEEP PACKET VIEWER: ACTUAL PAYLOAD DECODING 🔬 {' '*33}{Style.RESET_ALL}\n")
    print(f"{Style.BRIGHT}Starting Deep Packet Inspector Engine...{Style.RESET_ALL}")
    print(f"{Fore.YELLOW}Press Ctrl+C at any time to stop the capture.{Fore.RESET}")
    print(f"\n{Style.BRIGHT}{Fore.BLACK}Listening on Primary Interface...{Style.RESET_ALL}\n")
    
    try:
        sniff(prn=process_packet, store=False)
    except KeyboardInterrupt:
        print(f"\n{Fore.RED}🛑 Capture stopped cleanly by user.{Fore.RESET}")
    except PermissionError:
        print(f"\n{Fore.RED}❌ Permission Denied. You MUST run this script directly as an Administrator.{Fore.RESET}")
    except Exception as e:
        print(f"\n{Fore.RED}❌ Error starting capture: {e}{Fore.RESET}")

if __name__ == '__main__':
    main()
