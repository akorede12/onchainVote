const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/data', async (req, res) => {
  try {
    const response = await axios.get('https://rpc-mumbai.matic.today/');
    res.send(response.data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
