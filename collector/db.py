import os
import mysql.connector
from dotenv import load_dotenv
from loguru import logger
import time

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "office_dpi")

def get_db_connection(max_retries=3):
    retries = 0
    while retries < max_retries:
        try:
            conn = mysql.connector.connect(
                host=DB_HOST,
                user=DB_USER,
                password=DB_PASSWORD,
                database=DB_NAME
            )
            return conn
        except mysql.connector.Error as err:
            logger.error(f"Database connection failed: {err}")
            retries += 1
            if retries < max_retries:
                logger.info(f"Retrying in 5 seconds... ({retries}/{max_retries})")
                time.sleep(5)
    return None

def insert_flows(flows):
    if not flows:
        return
        
    conn = get_db_connection()
    if not conn:
        logger.error("Could not connect to the database to insert flows.")
        return

    cursor = conn.cursor()
    # Prepare batch insert query
    insert_query = """
    INSERT INTO network_flows 
    (src_ip, dst_ip, src_port, dst_port, protocol, application_name, application_category, bytes_sent, bytes_received, last_seen, flow_duration)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP, %s)
    """
    
    data_to_insert = []
    for flow in flows:
        protocol_str = getattr(flow, 'protocol', 'UNKNOWN')
        # if dictionary (from json loading)
        if isinstance(flow, dict):
            data_to_insert.append((
                flow.get("src_ip"),
                flow.get("dst_ip"),
                flow.get("src_port"),
                flow.get("dst_port"),
                str(flow.get("protocol", "UNKNOWN")),
                flow.get("application_name", "Unknown"),
                flow.get("application_category", "Unknown"),
                flow.get("bytes_sent", 0),
                flow.get("bytes_received", 0),
                flow.get("flow_duration", 0)
            ))
        else:
            # if from NFStream object directly
            data_to_insert.append((
                flow.src_ip,
                flow.dst_ip,
                flow.src_port,
                flow.dst_port,
                str(protocol_str),
                flow.application_name,
                flow.application_category,
                flow.src2dst_bytes,
                flow.dst2src_bytes,
                flow.bidirectional_duration_ms
            ))

    try:
        cursor.executemany(insert_query, data_to_insert)
        conn.commit()
        logger.info(f"Successfully inserted {cursor.rowcount} flows into the database.")
    except mysql.connector.Error as err:
        logger.error(f"Failed inserting flows: {err}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

def insert_deep_packet(p_dict):
    conn = get_db_connection()
    if not conn: return
    
    cursor = conn.cursor()
    query = """
    INSERT INTO deep_packet_logs 
    (protocol, src_ip, src_port, dst_ip, dst_port, payload_size, hex_dump, ascii_dump, decoded_data, decoded_explanation, insight)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    try:
        cursor.execute(query, (
            p_dict.get('protocol'), p_dict.get('src_ip'), p_dict.get('src_port'),
            p_dict.get('dst_ip'), p_dict.get('dst_port'), p_dict.get('payload_size'),
            p_dict.get('hex_dump'), p_dict.get('ascii_dump'),
            p_dict.get('decoded_data'), p_dict.get('decoded_explanation'), p_dict.get('insight')
        ))
        conn.commit()
        print('Successfully inserted packet to DB!')
    except mysql.connector.Error as err:
        logger.error(f"Failed inserting deep packet log: {err}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    logger.info("Testing database connection...")
    conn = get_db_connection(max_retries=1)
    if conn:
        logger.info("Connection successful!")
        conn.close()
    else:
        logger.error("Connection failed. Check your MySQL server and .env configuration.")
