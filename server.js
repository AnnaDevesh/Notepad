const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const connectionString =  'mongodb://127.0.0.1:27017/MyData';

mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  });

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
},{ collection: 'users' });

const homeSchema=new mongoose.Schema({
    title:String,
    description:String,
    loginid:String,
},{collection:'notes'})

const AboutSchema = new mongoose.Schema({
    Address: String,
    Number: String,
});


const UserModel = mongoose.model("users", userSchema);
const HomeModel=mongoose.model("notes",homeSchema);
const AboutModel=mongoose.model("Aboutes",AboutSchema);

app.post('/about',(req,res)=>{
    AboutModel.create(req.body)
    .then(user => res.json(user))
    .catch(error => res.json({ error: "Error creating user" }));
})

app.post('/signup', (req, res) => {
    const { username, password } = req.body;
  
    UserModel.findOne({ username })
      .then(existingUser => {
        if (existingUser) {
          return res.status(400).json({ error: 'Username already exists' });
        }
  
        // Create a new user
        return UserModel.create({ username, password });
      })
      .then(newUser => res.json(newUser))
      .catch(error => res.status(500).json({ error: 'Error creating user', details: error.message }));
  });

app.post('/home',(req,res)=>{
    const { title, description,loginid} = req.body;
    HomeModel.create({title,description,loginid})
    .then(user => alert(user))
        .catch(error => res.json({ error: "Error creating user" }));
})


const { ObjectId } = require('mongoose').Types;

app.get('/home/:id', async (req, res) => {
  const userId = req.params.id;
  if (!ObjectId.isValid(userId)) {
    return res.status(404).json({ error: 'Invalid User ID' });
  }

  try {
    const notes = await HomeModel.find({ loginid:userId }); // Assuming userId is the correct field name
    res.status(200).json(notes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/login',(req,res)=>{
    const {name,pass}=req.body;
    UserModel.findOne({username:name}).then(user=>{
        if(user){
            if(user.password==pass){
                res.send(user);
            }else{
                res.send("failed")
            }
        }else{
            res.send("User Not exist")
        }
    }

    )
})
app.delete('/home/:id', async (req, res) => {
    const noteId = req.params.id;
    try {
      const deletedNote = await HomeModel.findByIdAndDelete(noteId);
  
      if (!deletedNote) {
        return res.status(404).json({ message: 'Note not found' });
      }
  
      res.json({ message: 'Note deleted successfully' });
    } catch (error) {
      console.error('Error deleting note:', error.message);
      res.status(500).send('Internal Server Error');
    }
  });
app.get('/',(req,res)=>{
    res.send("Deevvv")
});
app.get('/edit/:id',async (req,res)=>{
    const dev=req.params.id;
    const updateNote = await HomeModel.findById(dev);
    res.send(updateNote);
})
app.put('/edit/:id',async (req,res)=>{
    const data=req.body;
    const id=req.params.id;
    await HomeModel.findByIdAndUpdate(id,data);
})
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
});