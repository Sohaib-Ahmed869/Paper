const express = require('express');
const mongoose = require('mongoose');
const UserRoutes = require('./Routes/user');
const cors = require('cors');

const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/paper').
    then(() => console.log('Connected to MongoDB')).
    catch(err => console.error(err));

app.use(express.json());
app.use(cors());


app.use('/user', UserRoutes);

app.listen(3000, () => console.log('Server running on port 3000'));