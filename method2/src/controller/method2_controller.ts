import { Request, Response } from 'express';
import { MongoClient, Document } from 'mongodb';
import client from '../service/db_client';

interface GpsData {
    title: string;
    context: string;
    timestamp: string;
}

// Connection to MongoDB
const db = client.db('method_2');
let collections: any[] = []; // Global array to store collections

// Ensure connection to MongoDB
client.connect().then(async () => {
    console.log('Connected to MongoDB for method_2');
    collections = await db.listCollections().toArray(); // Initialize collections array
}).catch(err => {
    console.error('Error connecting to MongoDB for method_2:', err);
});

// Handler for POST method2 data insertion
export const postMethod2 = async (req: Request, res: Response) => {
    try {
        const { title, context, timestamp } = req.body;
        console.log('Received data for method_2:', { title, context, timestamp });

        const collectionName = `gps_${new Date(timestamp).toISOString().split('T')[0].replace(/-/g, '_')}`;
        const collection = db.collection(collectionName);

        // Ensure collection exists
        if (!(await collectionExists(collectionName))) {
            await db.createCollection(collectionName);
            console.log(`Created collection: ${collectionName}`);
        }

        // Ensure index on timestamp field
        await ensureIndex(collection, 'timestamp');

        const result = await collection.insertOne({ title, context, timestamp });
        console.log('Insert result for method_2:', result);

        res.status(200).send(`Data inserted into ${collectionName} collection in method_2`);
    } catch (err) {
        console.error('Error inserting data for method_2:', err);
        res.status(500).send('Error inserting data: ' + err);
    }
};

// Handler for GET method2 data fetching
export const getMethod2Data = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = req.query;
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        console.log('Fetching data for method_2 between:', start, 'and', end);

        const startTime = process.hrtime();
        const data: GpsData[] = [];

        const startDateString = start.toISOString().split('T')[0].replace(/-/g, '_');
        const endDateString = end.toISOString().split('T')[0].replace(/-/g, '_');

        // Use for loop for better readability and control
        for (let i = 0; i < collections.length; i++) {
            const collectionName = collections[i].name;
            if (collectionName.startsWith('gps_')) {
                const collectionDate = collectionName.split('gps_')[1];
                if (collectionDate >= startDateString && collectionDate <= endDateString) {
                    const collectionData = await db.collection(collectionName).find({
                        timestamp: { $gte: start.toISOString(), $lte: end.toISOString() }
                    }).toArray();

                    collectionData.forEach(doc => {
                        data.push({
                            title: doc.title,
                            context: doc.context,
                            timestamp: doc.timestamp,
                        });
                    });
                }
            }
        }

        const executionTime = calculateExecutionTime(startTime);
        console.log('Fetched data for method_2:', data.length, 'documents');

        res.status(200).json({
            data,
            executionTime: `${executionTime.toFixed(2)} ms`
        });
    } catch (err) {
        console.error('Error fetching data for method_2:', err);
        res.status(500).send('Error fetching data: ' + err);
    }
};

// Helper function to check if collection exists
async function collectionExists(collectionName: string): Promise<boolean> {
    const collections = await db.listCollections().toArray();
    return collections.some(col => col.name === collectionName);
}

// Helper function to ensure index exists on collection
async function ensureIndex(collection: any, fieldName: string): Promise<void> {
    const indexExists = await collection.indexExists(fieldName);
    if (!indexExists) {
        await collection.createIndex({ [fieldName]: 1 });
    }
}

// Helper function to calculate execution time
function calculateExecutionTime(startTime: [number, number]): number {
    const endTime = process.hrtime(startTime);
    return (endTime[0] * 1000) + (endTime[1] / 1000000);
}
