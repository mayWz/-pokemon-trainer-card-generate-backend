# Trainer Card maker
Last updated: 2020 Jan 12

2 days project for internal group to make trainer pokemon card. 
- Pokemon Sword Sheild 

Concept
- Keep it simple
- Node.js + Express.js
- Serverless + lambad to save the cost

API spec
- GET `/trainers` 
    - get all trainers data
- GET `/trainers/:id`
    - get trainer with id 
- POST `/trainers`
    - create a new trainer
- PUT `/trainers`
    - update trainers with id
- DELETE `/trainers`
    - delete trainer 
- POST `signedurl`
    - get S3 signed url for upload image (FE)


How to install

first install package
```npm install```

How to install 

for first deploy run 
```npm run build; npm run deploy```
