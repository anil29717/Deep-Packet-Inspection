# 🌐 Office DPI Monitor (Deep Packet Inspection)

**Office DPI Monitor** is a full-stack, real-time network traffic analysis platform designed to sit on your local interface and transparently monitor, aggregate, and deeply inspect the packets flowing across your network. 

Unlike traditional metadata-only monitors, this project is built to crack open network frames and visualize the **ACTUAL payload** being transmitted over the wire.

---

## 🚀 What This Project Can Do

This system is broken down into three main continuous pipelines:

1. **High-Speed Flow Aggregation:** 
   * Leverages Python `nfstream` to bundle thousands of individual packets into continuous connections (Flows).
   * Automatically calculates bidirectional sizes, durations, and categorizes the application heuristic (e.g., streaming vs web vs database).
   
2. **Deep Packet Decoding Engine:** 
   * A secondary `scapy` Python engine continuously dissects packets at the byte level.
   * Strips away Ethernet, IP, TCP, and UDP layers to natively decode raw Application layer protocols in real-time.
   * Isolates specific traffic types (DNS, HTTP, TLS, DHCP) and translates absolute binary into human-readable English concepts.

3. **Live Web Presentation:** 
   * A modern React + TailwindCSS dashboard connects via Node.js/Express.
   * Features WebSocket/polling integration for "Live Updating" graphical interfaces and data-tables immediately as traffic flows across your Wi-Fi or Ethernet card.

---

## 🔍 What This Project Can Show You

Through the **Dashboard** and the **Deep Packet Knowledge** interface, the project explicitly reveals the hidden realities of your background network traffic:

### 1. Actual Domain & Website Destinations
* **DNS Queries:** See the exact website names (`google.com`, `reddit.com`) your computer is asking to visit before the connection even starts.
* **HTTPS/TLS Handshakes (SNI):** Even though HTTPS traffic is securely encrypted, the monitor extracts the Server Name Indication (SNI) string from the initial handshake—showing you precisely *which* secure servers apps on your network are talking to in the background.

### 2. Exposed Web Content (HTTP)
* Intercepts unencrypted `HTTP` protocol traffic.
* Extracts the exact requested paths (e.g., `GET /images/logo.png HTTP/1.1`) and the web browser's `User-Agent` strings.
* Proves that legacy/unencrypted web traffic is fully visible to anyone monitoring the airwaves.

### 3. Local Computer Discovery Names
* **LLMNR & NetBIOS:** Windows computers constantly shout their names across the local network to find each other (e.g., "DESKTOP-USER123 is looking for printer"). This tool captures and extracts those exact computer/share names from the multicast packets.
* **DHCP Configuration:** Shows the hostname of new devices joining the Wi-Fi network and the IP addresses they are requesting from the router.

### 4. Raw Hex & ASCII String Matrices
* For every captured deep packet, the system generates a classic side-by-side **Hexadecimal vs. ASCII** matrix view.
* If a custom application is transmitting plain text, JSON, or XML over a random protocol, you will physically see the strings of text extracted natively in the web UI.

### 5. Advanced Flow Metircs
* Top "Talkers" on the network (which internal IP is downloading/uploading the most).
* Aggregate pie charts splitting the exact ratio of traffic consumed by Cloud, Web, System, or Encrypted applications.

---

## 🛠️ Technology Stack

* **Collector / Sniffer:** Python 3.x, `scapy`, `nfstream`, `colorama`, `Npcap` driver (for Windows packet hooking).
* **Backend Database:** MySQL (Tables: `network_flows`, `deep_packet_logs`, `daily_app_stats`).
* **REST API:** Node.js, Express.js, `mysql2`.
* **Frontend UI:** React.js (Vite), Tailwind CSS, Material UI, Recharts, `date-fns`.

---

## ⚙️ Running the Project

To start the full ecosystem, open three terminal windows from the `D:\DPI` root directory:

1. **Start the API Server**
   ```bash
   cd api
   npm run dev
   ```

2. **Start the Web Frontend**
   ```bash
   cd frontend
   npm run dev
   ```
   *The UI will be accessible at http://localhost:5173*

3. **Start the Real-time Collectors** (Requires Administrator Privileges for Wi-Fi hooking)
   ```bash
   cd collector
   # Activate virtual environment
   ..\venv\Scripts\activate
   
   # Start Flow Collector (Dashboard Stats)
   python main.py
   
   # Start Payload Extractor (Deep Packet Knowledge)
   python show_real_data.py
   ```

---

## 📸 Screenshots

### Dashboard View
> ```markdown
> [Dashboard Screenshot](./path/Dashboard.png)
> ```

### Deep Packet Knowledge

> ```markdown
> [Deep Packet View](./path/DeepPacket.png)
> ```

### Analytics / Flows
> ```markdown
> [Analytics View](./path/analytics.png)
> ```
