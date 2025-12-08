
import time
import random
import requests
import json
from datetime import datetime

API_URL = "http://localhost:5000/api/v1/bridge/validate-cross-chain"
HEADERS = {"Content-Type": "application/json"}

source_chains = ["Ethereum", "BSC", "Polygon", "Avalanche", "QIE"]
dest_chains = ["QIE", "Ethereum", "BSC"]

def generate_random_tx():
    """Generates a random transaction payload."""
    tx_hash = "0x" + "".join([random.choice("0123456789abcdef") for _ in range(64)])
    
    payload = {
        "transaction_hash": tx_hash,
        "source_chain": random.choice(source_chains),
        "dest_chain": random.choice(dest_chains),
        "amount": round(random.uniform(10, 10000), 2)
    }
    return payload

def run_generator():
    """Runs the traffic generator loop."""
    print(f"🚀 Starting Traffic Generator...")
    print(f"Target: {API_URL}")
    print("Press Ctrl+C to stop.\n")

    count = 0
    try:
        while True:
            data = generate_random_tx()
            try:
                response = requests.post(API_URL, json=data, headers=HEADERS)
                if response.status_code == 200:
                    print(f"[{datetime.now().strftime('%H:%M:%S')}] ✅ Broadcast Tx {data['transaction_hash'][:10]}... Amount: {data['amount']}")
                else:
                    print(f"[{datetime.now().strftime('%H:%M:%S')}] ❌ Failed: {response.status_code} - {response.text}")
            except Exception as e:
                print(f"[{datetime.now().strftime('%H:%M:%S')}] ⚠️  Connection Error: {e}")

            count += 1
            if count % 5 == 0:
                print("--- Batch Complete ---")
            
            # Random delay between 2 and 5 seconds
            time.sleep(random.uniform(2, 5))

    except KeyboardInterrupt:
        print("\n🛑 Generator stopped.")

if __name__ == "__main__":
    run_generator()
