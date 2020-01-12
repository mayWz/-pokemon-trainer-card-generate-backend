const AWS = require('aws-sdk');
const express = require('express');
const uuid = require('uuid');
const IS_OFFLINE = process.env.NODE_ENV !== 'prod';
const TRAINERS_TABLE = process.env.TABLE;
const dynamoDb = IS_OFFLINE === true ?
    new AWS.DynamoDB.DocumentClient({
        region: 'ap-southeast-1',
        endpoint: 'http://127.0.0.1:8080',
    }) :
    new AWS.DynamoDB.DocumentClient();
const router = express.Router();
router.get('/trainers', (req, res) => {
    const params = {
        TableName: TRAINERS_TABLE
    };
    dynamoDb.scan(params, (error, result) => {
        if (error) {
            res.status(400).json({ error: 'Error fetching the trainers' });
        }
        res.json(result.Items);
    });
});
router.get('/trainers/:id', (req, res) => {
    const id = req.params.id;
    const params = {
        TableName: TRAINERS_TABLE,
        Key: {
            id
        }
    };
    dynamoDb.get(params, (error, result) => {
        if (error) {
            res.status(400).json({ error: 'Error retrieving Trainer' });
        }
        if (result.Item) {
            res.json(result.Item);
        } else {
            res.status(404).json({ error: `Trainer with id: ${id} not found` });
        }
    });
});
router.post('/trainers', (req, res) => {
    const name = req.body.name;
    const id = uuid.v4();
    const params = {
        TableName: TRAINERS_TABLE,
        Item: {
            id,
            name
        },
    };
    dynamoDb.put(params, (error) => {
        if (error) {
            res.status(400).json({ error: 'Could not create Trainer' });
        }
        res.json({
            id,
            name
        });
    });
});
router.delete('/trainers/:id', (req, res) => {
    const id = req.params.id;
    const params = {
        TableName: TRAINERS_TABLE,
        Key: {
            id
        }
    };
    dynamoDb.delete(params, (error) => {
        if (error) {
            res.status(400).json({ error: 'Could not delete Trainer' });
        }
        res.json({ success: true });
    });
});
router.put('/trainers', (req, res) => {
    const id = req.body.id;
    const name = req.body.name;
    const params = {
        TableName: TRAINERS_TABLE,
        Key: {
            id
        },
        UpdateExpression: 'set #name = :name',
        ExpressionAttributeNames: { '#name': 'name' },
        ExpressionAttributeValues: { ':name': name },
        ReturnValues: "ALL_NEW"
    }
    dynamoDb.update(params, (error, result) => {
        if (error) {
            res.status(400).json({ error: 'Could not update Trainer' });
        }
        res.json(result.Attributes);
    })
});
module.exports = router;