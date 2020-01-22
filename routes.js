const AWS = require('aws-sdk');
const express = require('express');
const Sentry = require("@sentry/node");
const uuid = require('uuid');
const IS_OFFLINE = process.env.NODE_ENV !== 'prod';
const TRAINERS_TABLE = process.env.TABLE;
const BUCKET_NAME = process.env.CARD_BUCKET;
const s3 = new AWS.S3({
    apiVersion: '2006-03-01', 
    signatureVersion: 'v4'
});
const dynamoDb = IS_OFFLINE === true ?
    new AWS.DynamoDB.DocumentClient({
        region: 'ap-southeast-1',
        endpoint: 'http://127.0.0.1:8080',
    }) :
    new AWS.DynamoDB.DocumentClient();
const router = express.Router();
Sentry.init({ dsn: 'https://06f9a3d6c6b745e197fef322a1d0ad22@sentry.io/1891197' });

router.get('/trainers', (req, res) => {
    const params = {
        TableName: TRAINERS_TABLE
    };
    dynamoDb.scan(params, (err, result) => {
        if (err) {
            return res.status(400).json({ error: 'Error fetching the trainers' });
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
    dynamoDb.get(params, (err, result) => {
        if (err) {
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
    const id = uuid.v4();
    // TODO: handle vallidate request and sanitize
    let {
        facebookName, 
        ign, 
        friendCode, 
        pokemonList, 
        pokemonData, 
        badge, 
        sourceImage, 
        cardImage, 
        battleSeason,
        remark,
        status
    }  = req.body;
    let createdDate = new Date().toISOString();
    let updatedDate = new Date().toISOString();
    const params = {
        TableName: TRAINERS_TABLE,
        Item: {
            id,
            facebookName,
            ign,
            friendCode,
            pokemonList,
            pokemonData,
            badge,
            sourceImage,
            cardImage,
            battleSeason,
            remark,
            status,
            createdDate,
            updatedDate
        },
    };

    dynamoDb.put(params, (err, data) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({
            id,
            facebookName,
            ign
        });
    });
});

router.delete('/trainers/:id', (req, res) => {
    const id = req.params.id;
    let status = 0;
    let updatedDate = new Date().toISOString();
    const params = {
        TableName: TRAINERS_TABLE,
        Key: {
            id
        },
        UpdateExpression: 'set #status = :status, #updatedDate = :updatedDate',
        ExpressionAttributeNames: { 
            '#status': 'status', 
            '#updatedDate': 'updatedDate'
        },
        ExpressionAttributeValues: { 
            ':status': status ,
            ':updatedDate': updatedDate
        },
        ReturnValues: 'UPDATED_NEW'
    };
    dynamoDb.update(params, (err) => {
        if (err) {
            res.status(400).json({ error: 'Could not delete Trainer' });
        }
        res.json({ success: true });
    });
});

router.put('/trainers', (req, res) => {
    const id = req.body.id;
    let {
        facebookName, 
        ign, 
        friendCode, 
        pokemonList, 
        pokemonData, 
        badge, 
        sourceImage, 
        cardImage, 
        battleSeason,
        remark,
        status,
    }  = req.body;
    let updatedDate = new Date().toISOString();
    const params = {
        TableName: TRAINERS_TABLE,
        Key: {
            id
        },
        UpdateExpression: `set 
            #facebookName = :facebookName, 
            #ign = :ign, 
            #friendCode = :friendCode,
            #pokemonData = :pokemonData, 
            #pokemonList = :pokemonList, 
            #badge = :badge, 
            #sourceImage = :sourceImage, 
            #cardImage = :cardImage, 
            #battleSeason = :battleSeason,
            #remark = :remark,
            #status = :status,
            #updatedDate = :updatedDate
            `,
        ExpressionAttributeNames: { 
            '#facebookName': 'facebookName', 
            '#ign' : 'ign', 
            '#friendCode': 'friendCode', 
            '#pokemonList': 'pokemonList', 
            '#pokemonData': 'pokemonData', 
            '#badge': 'badge', 
            '#sourceImage': 'sourceImage', 
            '#cardImage': 'cardImage', 
            '#battleSeason': 'battleSeason',
            '#remark': 'remark',
            '#status': 'status',
            '#updatedDate': 'updatedDate'
    
        },
        ExpressionAttributeValues: { 
            ':facebookName': facebookName, 
            ':ign': ign, 
            ':friendCode': friendCode, 
            ':pokemonList': pokemonList, 
            ':pokemonData': pokemonData, 
            ':badge': badge, 
            ':sourceImage': sourceImage, 
            ':cardImage': cardImage, 
            ':battleSeason': battleSeason,
            ':remark': remark,
            ':status': status,
            ':updatedDate': updatedDate
        },
        ReturnValues: "ALL_NEW"
    }
    dynamoDb.update(params, (err, result) => {
        if (err) {
            res.status(400).json({ error: 'Could not update Trainer' });
        }
        res.json(result.Attributes);
    })
});
// signedURL
router.post('/signedurl', (req, res) => {
    const fileName = 'card/' + req.body.filename;
    const fileType = req.body.filetype;
    const params = {
        Bucket: BUCKET_NAME,
        Key: fileName,
        ContentType: fileType,
        ACL: 'public-read',
        Expires: 300
    }
    s3.getSignedUrl('putObject', params, (err, url) => {
        if (err) {
            res.status(400).json({ error: 'Cannot generate Signed URL' })
        }
        res.json({url});
    })
    
});

module.exports = router;