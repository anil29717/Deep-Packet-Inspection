import os
import sys
import socket
import logging

# Set Scapy log level to ERROR to suppress warnings
logging.getLogger("scapy.runtime").setLevel(logging.ERROR)

try:
    from colorama import init, Fore, Back, Style
    init(autoreset=True)
except ImportError:
    print("Please install colorama: pip install colorama")
    sys.exit(1)

try:
    # Explicitly import layers we need
    from scapy.all import sniff, conf, Ether, IP, TCP, UDP, DNS, DNSQR, Raw
except ImportError:
    print("Please install scapy: pip install scapy")
    sys.exit(1)

# ==============================================================================
# 1. NETWORK & ENVIRONMENT SETUP
# ==============================================================================
def get_local_info():
    """Dynamically determine the active local IP and Office Subnet."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # Doesn't actually connect, just routes immediately to determine local IP
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    
    parts = ip.split('.')
    # Assume a standard /24 for demonstration purposes
    network = f"{parts[0]}.{parts[1]}.{parts[2]}.0/24"
    return ip, network

LOCAL_IP, OFFICE_NET = get_local_info()
LOCAL_SUBNET_PREFIX = ".".join(LOCAL_IP.split(".")[:2]) + "."

# ==============================================================================
# 2. HELPER FUNCTIONS
# ==============================================================================
def hexdump(src, length=16):
    """Generate a clean classic hex + ASCII dump for payloads."""
    result = []
    digits = 4 if isinstance(src, str) else 2
    for i in range(0, len(src), length):
        s = src[i:i+length]
        hexa = b' '.join([b"%02X" % x for x in s]) if isinstance(s, bytes) else ' '.join(["%02X" % ord(x) for x in s])
        text = b''.join([bytes([x]) if 0x20 <= x < 0x7F else b'.' for x in s]) if isinstance(s, bytes) else ''.join([x if 0x20 <= ord(x) < 0x7F else '.' for x in s])
        if isinstance(hexa, bytes): hexa = hexa.decode('utf-8')
        if isinstance(text, bytes): text = text.decode('utf-8', errors='ignore')
        result.append(f"{i:04x}   {hexa:<{length*(digits + 1)}}   {text}")
    return '\n'.join(result)

def dpi_magic(packet, payload_bytes):
    """
    Perform deep-ish packet inspection by looking at ports and raw payloads.
    Returns: (app_info_string, color, emoji_icon)
    """
    app_info = "Unknown / Encrypted or Generic Traffic"
    app_color = Fore.WHITE
    icon = "❓"

    # DNS Traffic
    if packet.haslayer(DNS) and packet.haslayer(DNSQR):
        qname = packet[DNSQR].qname.decode('utf-8', errors='ignore') if packet[DNSQR].qname else "Unknown"
        app_info = f"DNS Query: Resolving {qname}"
        app_color = Fore.MAGENTA
        icon = "🔍"
        
    elif packet.haslayer(TCP):
        dport = packet[TCP].dport
        sport = packet[TCP].sport
        
        # HTTP
        if dport == 80 or sport == 80:
            app_info = "HTTP Web Traffic (Cleartext)"
            app_color = Fore.GREEN
            icon = "🌐"
            if payload_bytes:
                # HTTP Method Extraction
                if any(payload_bytes.startswith(m) for m in [b"GET ", b"POST ", b"PUT ", b"DELETE "]):
                    lines = payload_bytes.split(b'\r\n')
                    if lines: 
                        app_info += f" | {lines[0].decode('utf-8', errors='ignore')}"
                elif payload_bytes.startswith(b"HTTP/"):
                    lines = payload_bytes.split(b'\r\n')
                    if lines: 
                        app_info += f" | {lines[0].decode('utf-8', errors='ignore')}"
                        
        # HTTPS/TLS
        elif dport == 443 or sport == 443:
            app_info = "HTTPS / TLS Encrypted Web Traffic"
            app_color = Fore.CYAN
            icon = "🔒"
            if payload_bytes and len(payload_bytes) > 5:
                # Check for TLS Client Hello (Handshake: 0x16, Version: 0x03)
                if payload_bytes[0] == 0x16 and payload_bytes[1] == 0x03:
                    app_info += " (TLS Handshake Initialized)"
                    try:
                        import re
                        # Primitive SNI extraction heuristic for demo
                        matches = re.findall(b'([a-z0-9.-]+\.[a-z]{2,})', payload_bytes[40:200])
                        if matches:
                            snis = [m.decode('utf-8') for m in set(matches) if len(m) > 4 and b'.' in m]
                            if snis:
                                app_info += f" | SNI detected: {snis[0]}"
                    except:
                        pass
        
        # SSH
        elif dport == 22 or sport == 22:
            app_info = "SSH Secure Shell Access"
            app_color = Fore.YELLOW
            icon = "🔑"
            
        # Databases
        elif dport == 1433 or sport == 1433:
            app_info = "MS SQL Server Database Traffic"
            app_color = Fore.RED
            icon = "🛢️"
        elif dport == 3306 or sport == 3306:
            app_info = "MySQL Database Traffic"
            app_color = Fore.RED
            icon = "🛢️"
        elif dport == 5432 or sport == 5432:
            app_info = "PostgreSQL Database Traffic"
            app_color = Fore.RED
            icon = "🛢️"
            
    return app_info, app_color, icon

# ==============================================================================
# 3. PACKET PROCESSING PIPELINE
# ==============================================================================
def packet_callback(packet):
    """Called by scapy for every sniffed packet."""
    try:
        # We only care about Ethernet packets
        if not packet.haslayer(Ether): return
        
        has_payload = packet.haslayer(Raw)
        is_dns = packet.haslayer(DNS)
        
        # To avoid console flooding, only show packets that have data payloads or are DNS
        if not has_payload and not is_dns:
            return

        print(f"\n{Style.BRIGHT}{Fore.BLUE}{'='*80}")
        print(f"📡 {Style.BRIGHT}OFFICE DPI: PACKET DETECTED {Fore.BLUE}{'='*49}{Fore.RESET}")
        
        # 1. Ethernet/MAC Layer
        eth = packet[Ether]
        print(f"{Fore.YELLOW}▸ [MAC Layer] {Fore.RESET}Src MAC: {eth.src} -> Dst MAC: {eth.dst}")
        
        # 2. IP Layer
        if packet.haslayer(IP):
            ip = packet[IP]
            
            # Identify Direction
            if ip.src == LOCAL_IP:
                direction = f"{Fore.GREEN}➡️ OUTGOING (From this PC){Fore.RESET}"
            elif ip.dst == LOCAL_IP:
                direction = f"{Fore.CYAN}⬅️ INCOMING (To this PC){Fore.RESET}"
            else:
                direction = f"{Fore.YELLOW}↔️ TRANSIT{Fore.RESET}"
                
            # Identify internal/external traffic based on typical office subnet sharing
            if ip.src.startswith(LOCAL_SUBNET_PREFIX) and ip.dst.startswith(LOCAL_SUBNET_PREFIX):
                internal = f"{Fore.MAGENTA}🏢 INTERNAL OFFICE TRAFFIC (LAN){Fore.RESET}"
            else:
                internal = f"{Fore.RED}🌍 EXTERNAL INTERNET TRAFFIC (WAN){Fore.RESET}"
            
            print(f"{Fore.GREEN}▸ [IP Layer]  {Fore.RESET}{ip.src} -> {ip.dst} | TTL: {ip.ttl} | Protocol: {ip.proto}")
            print(f"              {direction} | {internal}")
            
            # 3. Transport Layer
            payload_bytes = b""
            if packet.haslayer(TCP):
                tcp = packet[TCP]
                print(f"{Fore.CYAN}▸ [Transport] {Fore.RESET}TCP SrcPort: {tcp.sport} -> DstPort: {tcp.dport} | Flags: {tcp.flags}")
                if has_payload: payload_bytes = bytes(packet[Raw])
            elif packet.haslayer(UDP):
                udp = packet[UDP]
                print(f"{Fore.CYAN}▸ [Transport] {Fore.RESET}UDP SrcPort: {udp.sport} -> DstPort: {udp.dport} | Len: {udp.len}")
                if has_payload: payload_bytes = bytes(packet[Raw])
            
            # 4. Application Layer & Deep Packet Inspection
            app_info, app_color, icon = dpi_magic(packet, payload_bytes)
            print(f"{app_color}▸ [App DPI]   {Fore.RESET}{icon} {app_color}{Style.BRIGHT}{app_info}{Style.NORMAL}{Fore.RESET}")
            
            # 5. Payload Hex Dump & ASCII Preview
            if payload_bytes:
                print(f"{Fore.LIGHTBLACK_EX}▸ [Payload]   {Fore.RESET}Extracted ({len(payload_bytes)} bytes):")
                preview = hexdump(payload_bytes[:80]) # first 80 bytes for demo
                for line in preview.split('\n'):
                    print(f"              {Fore.LIGHTBLACK_EX}{line}")
                if len(payload_bytes) > 80:
                    print(f"              {Fore.LIGHTBLACK_EX}... [Data Truncated for Visual Demo] ...{Fore.RESET}")
                    
    except Exception as e:
        # Silently drop parsing errors in live streams
        pass

# ==============================================================================
# 4. MAIN EXECUTION
# ==============================================================================
def main():
    os.system('cls' if os.name == 'nt' else 'clear')
    print(f"{Back.BLUE}{Fore.WHITE}{Style.BRIGHT} 🚀 OFFICE WIFI EXPERT DPI MONITOR 🚀 {' '*42}{Style.RESET_ALL}\n")
    print(f"{Style.BRIGHT}Starting Deep Packet Inspection engine...{Style.RESET_ALL}")
    print(f"  {Fore.CYAN}Local IP Address     : {Fore.WHITE}{LOCAL_IP}")
    print(f"  {Fore.CYAN}Office Network Range : {Fore.WHITE}{OFFICE_NET}")
    print(f"  {Fore.YELLOW}Press Ctrl+C at any time to stop the capture.{Fore.RESET}")
    print(f"\n{Style.BRIGHT}{Fore.BLUE}{'='*80}")
    
    # Try to pick the active interface naming
    try:
        iface_name = conf.iface.name if hasattr(conf.iface, 'name') else str(conf.iface)
    except:
        iface_name = "Primary Interface"
        
    print(f"✅ {Fore.GREEN}System Ready. Npcap bound to interface: {iface_name}{Fore.RESET}")
    print(f"{Style.BRIGHT}{Fore.BLUE}{'='*80}")
    
    try:
        # Start sniffing. store=False is required for continuous monitoring to not blow up memory
        sniff(prn=packet_callback, store=False)
    except KeyboardInterrupt:
        print(f"\n{Fore.RED}🛑 Capture stopped cleanly by user.{Fore.RESET}")
    except PermissionError:
        print(f"\n{Fore.RED}❌ Permission Denied. You MUST run this script as an Administrator.{Fore.RESET}")
    except Exception as e:
        print(f"\n{Fore.RED}❌ Error starting capture: {e}{Fore.RESET}")
        print(f"{Fore.YELLOW}Make sure Npcap is properly installed and you are running as Admin.{Fore.RESET}")

if __name__ == '__main__':
    main()
