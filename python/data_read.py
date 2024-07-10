import csv
import requests
from concurrent.futures import ThreadPoolExecutor
from requests.exceptions import RequestException
from datetime import datetime, timedelta
import random


method1 = 'http://localhost:3000/method1/data'
method2 = 'http://localhost:3000/method2/data'


def generateRandomTimestamp(startDate, endDate):
    start = datetime.strptime(startDate, "%Y-%m-%d")
    end = datetime.strptime(endDate, "%Y-%m-%d")
    random_dt = start + timedelta(seconds=random.randint(0, int((end - start).total_seconds())))
    return random_dt.isoformat() + 'Z'


def fetchdData(url, startDate, endDate):
    try:
        response = requests.get(url, params={'startDate': startDate, 'endDate': endDate})
        response.raise_for_status()
        return response.json() if response.statusCode == 200 else None
    except RequestException as e:
        print(f"Error fetching data from {url} on {startDate} - {endDate}: {e}")
        return None

def extractExecutionTime(execution_time):
    try:
        return float(execution_time.split()[0]) if execution_time and execution_time != "N/A" else 0.0
    except ValueError:
        return 0.0

def writeToCsv(csvData, avgMethod1, avgMethod2, method1_label, method2_label, fileName):
    with open(fileName, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(['Start Date', 'End Date', method1_label, method2_label])
        writer.writerows(csvData)
        writer.writerow(['Average', '', avgMethod1, avgMethod2])
    print(f"Data saved to {fileName}")

def executeMethods(startDate, endDate, fileName):
    randomDate = [(generateRandomTimestamp(startDate, endDate), generateRandomTimestamp(startDate, endDate)) for _ in range(10)]

    csvData = []
    method1Times = []
    method2Times = []

    with ThreadPoolExecutor(max_workers=4) as executor:
        for start_dt, end_dt in randomDate:
            method1Result = executor.submit(fetchdData, method1, start_dt, end_dt).result()
            method1Time = extractExecutionTime(method1Result.get("executionTime") if method1Result else None)
            method1Times.append(method1Time)

            method2Result = executor.submit(fetchdData, method2, start_dt, end_dt).result()
            method2Time = extractExecutionTime(method2Result.get("executionTime") if method2Result else None)
            method2Times.append(method2Time)

            csvData.append([start_dt, end_dt, method1Time, method2Time])

    avgMethod1 = sum(method1Times) / len(method1Times) if method1Times else 0.0
    avgMethod2 = sum(method2Times) / len(method2Times) if method2Times else 0.0
    
    writeToCsv(csvData, avgMethod1, avgMethod2, 'Method1 (ms)', 'Method2 (ms)', fileName)





if __name__ == "__main__":
    startDate = '2024-01-01'
    endDate = '2024-06-30'
    fileName = 'random_methods_data.csv'
    executeMethods(startDate, endDate, fileName)
