import requests
import json
import random
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor

# URLs to send data
urls = [
    "http://test0.gpstrack.in/method1",
    "http://test2.gpstrack.in/method2"
]

# Number of records to send
num_records = 1000

# Function to generate a random timestamp between Jan and Jun 2024
def generateRandomTimestamp():
    startDate = datetime(2024, 1, 1)
    endDate = datetime(2024, 6, 30)
    randomDate = startDate + timedelta(
        seconds=random.randint(0, int((endDate - startDate).total_seconds()))
    )
    return randomDate.isoformat() + 'Z'

# Function to send a single record to a specific URL
def sendRecord(record_id, url):
    data = {
        "title": f"Sample Title {record_id}",
        "context": "Sample Context",
        "timestamp": generateRandomTimestamp()
    }

    response = requests.post(url, headers={"Content-Type": "application/json"}, data=json.dumps(data))
    return response.statusCode

# Using threads to send data to each URL sequentially
with ThreadPoolExecutor(max_workers=10) as executor:
    futures = []
    for url in urls:
        futures.extend(executor.submit(sendRecord, i, url) for i in range(1, num_records + 1))

# Handling results
for future in futures:
    try:
        statusCode = future.result()
        print(f"Status Code: {statusCode}")
    except Exception as e:
        print(f"An error occurred: {e}")
