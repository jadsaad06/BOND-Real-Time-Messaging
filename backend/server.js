const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };
const uri = "mongodb+srv://jadsaad:jadsaad@bond-messaging-app.txvyv.mongodb.net/?retryWrites=true&w=majority&appName=Bond-Messaging-App"

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello from MERN stack!');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}.`);
});


async function run() {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await mongoose.disconnect();
  }
}
run().catch(console.dir);
