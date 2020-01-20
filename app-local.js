const app = require('./app');
const port = 3450;
app.listen(port, () => {
    console.log(`listening on http://localhost:${port}`);
});