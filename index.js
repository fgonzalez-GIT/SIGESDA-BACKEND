const express = require('express')
const app = express()
const cors = require('cors')
const mysql = require('mysql2/promise')

app.use(cors())

// Configuración MySQL
const dbConfig = {
  host: 'localhost',
  user: 'sigesda_user',
  password: 'SiGesda2024!',
  database: 'sigesda'
}

let notes = [
  {
    id: 1,
    content: "HTML is easy",
    important: true
  },
  {
    id: 2,
    content: "Browser can execute only JavaScript",
    important: false
  },
  {
    id: 3,
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true
  },
  {
    id: 4,
    content: "Prueba",
    important: true
  }
]


app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
  })
  
  app.get('/api/notes', (request, response) => {
    response.json(notes)
  })

  app.get('/api/mongo', async (request, response) => {

    const { MongoClient, ServerApiVersion } = require('mongodb');
    const uri = "mongodb://localhost:27017/sigesda";
    console.log("uri", uri)

      // Create a MongoClient with a MongoClientOptions object to set the Stable API version
      const client = new MongoClient(uri);

      try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
        response.json({ok:"Pinged your deployment. You successfully connected to MongoDB!"})
      } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        response.status(500).json({error: "Cannot connect to MongoDB", details: error.message})
      } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
      }
    })

  app.get('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id)
    const note = notes.find(note => note.id === id)  
    if (note) {
      response.json(note)
    } else {
      response.status(404).end()
    }
  })

  app.delete('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id)
    notes = notes.filter(note => note.id !== id)
  
    response.status(204).end()
  })

  app.get('/api/mysql/notes', async (request, response) => {
    try {
      const connection = await mysql.createConnection(dbConfig)
      const [rows] = await connection.execute('SELECT * FROM notes ORDER BY id')
      response.json(rows)

    } catch (error) {
      console.error("Error fetching notes:", error);
      response.status(500).json({error: "Cannot fetch notes from MySQL"})
    }
  })

  app.get('/api/mysql/:content', async (request, response) => {
    const content = request.params.content

    try {
      const connection = await mysql.createConnection(dbConfig)
      const [result] = await connection.execute(
        'INSERT INTO notes (content, important) VALUES (?, ?)',
        [content, true]
      )
      await connection.end()

      console.log('note saved!', result.insertId)
      response.send('<h1>Nota Creada correctamente: '+ content +' (ID: '+result.insertId+')</h1>')

    } catch (error) {
      console.error("Error saving note:", error);
      response.status(500).json({error: "Cannot save note to MySQL"})
    }
  })

  const PORT = process.env.PORT || 3002
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })