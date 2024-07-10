import { Request, Response } from 'express';
import { MongoClient } from 'mongodb';
import MyConstance from '../constance';

const client = new MongoClient(MyConstance.dbUrl);

client.connect().then(() => {
    console.log('Connected to MongoDB for method_1');
}).catch(err => {
    console.error('Error connecting to MongoDB for method_1:', err);
});

export const postMethod1 = async (req: Request, res: Response) => {
    try {
        const { title, context, timestamp } = req.body;
        console.log('Received data for method_1:', { title, context, timestamp });

        const db = client.db(MyConstance.method_1);
        const collection = db.collection('data');

        const countDocuments = await collection.countDocuments({});
        if (countDocuments === 0) {
            console.log('Collection "data" does not exist in method_1 database. Creating...');
            await collection.insertOne({ test: 'data' });
            console.log('Collection "data" created successfully.');
        }

        const indexExists = await collection.indexExists('timestamp');
        if (!indexExists) {
            await collection.createIndex({ timestamp: 1 });
        }

        const result = await collection.insertOne({ title, context, timestamp });
        console.log('Insert result for method_1:', result);

        res.status(200).send('Data inserted into method_1 collection');
    } catch (err) {
        console.error('Error inserting data for method_1:', err);
        res.status(500).send('Error inserting data: ' + err);
    }
};
export const getMethod1Data = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = req.query;

        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        console.log('Fetching data for method_1 between:', start, 'and', end);

        const startTime = process.hrtime();

        const db = client.db(MyConstance.method_1);
        const collection = db.collection('data');

        // Find all documents that have timestamp within the specified range
        const data = await collection.find({
            timestamp: { $gte: start.toISOString(), $lte: end.toISOString() }
        }).toArray();

        const endTime = process.hrtime(startTime);
        const executionTime = (endTime[0] * 1000) + (endTime[1] / 1000000);

        console.log('Fetched data for method_1:', data.length, 'documents');

        res.status(200).json({
            data,
            executionTime: `${executionTime.toFixed(2)} ms`
        });
    } catch (err) {
        console.error('Error fetching data for method_1:', err);
        res.status(500).send('Error fetching data: ' + err);
    }
};