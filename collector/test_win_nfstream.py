from nfstream import NFStreamer

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

def test_nfstream():
    iface = get_windows_npcap_interface("Wi-Fi")
    print(f"Testing NFStreamer with n_meters=1 on {iface}")
    try:
        streamer = NFStreamer(source=iface, n_meters=1)
        for i, flow in enumerate(streamer):
            print(f"Captured flow: {flow.protocol} {flow.application_name}")
            if i > 2:
                break
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    test_nfstream()
