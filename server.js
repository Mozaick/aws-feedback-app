const express = require('express');
// Load the AWS SDK for JS
const AWS = require('aws-sdk');

const bodyParser = require('body-parser');

// Set a region to interact with (make sure it's the same as the region of your table)
AWS.config.update({ region: 'us-east-1' });

// Set a table name that we can use later on
const tableName = 'EmployeeFeedbackList';

// Create the Service interface for DynamoDB
const dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

// Create the Document Client interface for DynamoDB
const ddbDocumentClient = new AWS.DynamoDB.DocumentClient();

const app = express();

const PORT = 3002;

app.use(bodyParser.json());
app.get('/feedbacks', async (req, res) => {
  try {
    const params = {
      TableName: tableName,
    };
    const result = await dynamodb.scan(params).promise();

    const feedbackList = result.Items[0].FeedbackList.L.map((fb) => fb.S);
    console.log('This is the FeedbackList 📜:', feedbackList);

    const feedbackListRandom = () => {
      return feedbackList.length !== 0
        ? feedbackList[Math.floor(Math.random() * feedbackList.length)]
        : console.log('Feedback List is Empty!');
    };
    console.log('Random feedback is:', feedbackListRandom());

    res.status(200);
    res.json({feedback: feedbackListRandom()});
  } catch (error) {
    console.error(error);
  }
});

app.post('/addFeedback', async (req, res) => {
  try {
    const body = req.body;
    const newFeedback = 'this is a new feedback coming from POST request!!';

    const params = {
      TableName: 'EmployeeFeedbackList',
      Key: {
        FeedbackId: '123-abc-456',
      },
      UpdateExpression: 'set FeedbackList[20] = :r',
      ExpressionAttributeValues: {
        ':r': newFeedback,
      },
    };
    await ddbDocumentClient.update(params).promise();

    ddbDocumentClient.update(params, (err, data) => {
      if (err) {
        console.error("Something went wrong. This item can't be added");
        console.error('ERROR:-', JSON.stringify(err, null, 2));
      } else {
        console.log('New Feedback:-', JSON.stringify(body, null, 2));
        res.status(201);
        res.json(data);
      }
    });
  } catch (error) {
    console.error(error);
  }
});

app.listen(PORT, () => {
  console.log(
    `👂listening on port ${PORT} successfully on http://localhost:${PORT}`
  );
});
