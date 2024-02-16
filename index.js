const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config()

app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kg7cyoc.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    const menuCollection = client.db("bistroDB").collection("menu");
    const userCollection = client.db("bistroDB").collection("users");
    const reviewCullection = client.db("bistroDB").collection("reviews");
    const cartCullection = client.db("bistroDB").collection("carts");

    app.post('/users', async (req, res) => {
      const user = req.body;
      // insert email if user does not exists\\
      // yor can do this many ways {1.email unick, 2.upsert, 3.simple checking}
      const query = { email: user.email }
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'user already exsist', insertedId: null })
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    })
    app.get('/menu', async (req, res) => {
      const cursor = menuCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })
    app.get('/reviews', async (req, res) => {
      const cursor = reviewCullection.find();
      const result = await cursor.toArray();
      res.send(result);
    })
    app.post('/carts', async (req, res) => {
      const cartItem = req.body;
      const result = await cartCullection.insertOne(cartItem);
      res.send(result);
    })
    app.get('/carts', async (req, res) => {
      const email = req.query.email;
      const query = { email: email }
      const result = await cartCullection.find(query).toArray();
      res.send(result);
    })
    app.delete('/carts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCullection.deleteOne(query);
      res.send(result);
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send("bosss is sitting")
})
app.listen(port, () => {
  console.log(`boss is sitting on port ${port}`)
})