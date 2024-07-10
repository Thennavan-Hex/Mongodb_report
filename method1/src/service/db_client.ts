import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI || 'mongodb://mongo:27017';
const client = new MongoClient(uri);

client.connect().then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
});

export default client;
