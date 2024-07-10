import express from 'express';
import bodyParser from 'body-parser';
import method1Routes from './routes/method2_routes';
import MyConstance from './constances';

const app = express();

app.use(bodyParser.json());

app.use(method1Routes);

app.listen(MyConstance.port, () => {
    console.log(`Server is running on port ${MyConstance.port}`);
});
