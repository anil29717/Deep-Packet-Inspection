# Use Python 3.9 slim image
FROM python:3.9-slim

# Install necessary system packages for nfstream and MySQL client
RUN apt-get update && apt-get install -y \
    libpcap-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy collector source code
COPY collector/ collector/

# Command to run the collector
CMD ["python", "-u", "collector/main.py"]
