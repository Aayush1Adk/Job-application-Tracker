const express = require('express');
const cors = require('cors');
const applicationRouter = require('./Router/applicationRouter');

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", applicationRouter);

module.exports = app;

