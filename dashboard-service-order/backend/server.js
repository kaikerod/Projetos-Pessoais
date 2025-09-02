
const express = require('express');
const AWS = require('aws-sdk');
const app = express();
const port = 3000;

// Configure AWS
// Make sure to configure your credentials properly
// E.g., via environment variables, IAM roles, or ~/.aws/credentials
AWS.config.update({
  region: 'sa-east-1', // Example: 'sa-east-1'
  // endpoint: 'http://localhost:8000' // Uncomment for local DynamoDB
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

app.use(express.json());

// Example route to get all items from a table
app.get('/items', async (req, res) => {
  const params = {
    TableName: 'Dashboard-DB' // Replace with your table name
  };

  try {
    const data = await dynamodb.scan(params).promise();
    res.json(data.Items);
  } catch (err) {
    console.error("Error fetching items from DynamoDB:", err);
    res.status(500).send("Error fetching data");
  }
});

// Example route to add an item to a table
app.post('/items', async (req, res) => {
  const item = req.body; // Assumes item is sent in the request body
  const params = {
    TableName: 'Dashboard-DB', // Replace with your table name
    Item: item
  };

  try {
    await dynamodb.put(params).promise();
    res.status(201).send({ message: "Item added successfully", item });
  } catch (err) {
    console.error("Error adding item to DynamoDB:", err);
    res.status(500).send("Error saving data");
  }
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
