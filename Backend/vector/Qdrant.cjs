const { QdrantClient } = require('@qdrant/js-client-rest');
const dotenv = require('dotenv');
dotenv.config();
const client = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_KEY,
});

try {
    const result = client.getCollections();
    console.log('List of collections:', result.collections);
} catch (err) {
    console.error('Could not get collections:', err);
}
const qdrant = client;
module.exports = qdrant;
