const mongoose = require('mongoose');
mongoose
  .connect('mongodb+srv://carneiro:joaogoodman@login.i3fuljo.mongodb.net/')

  .then(() => {
    console.log('MongoDB conectado com Sucesso');
  })
  .catch(() => {
    console.log('Falhou');
  });

const usersSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const collection = mongoose.model('collection', usersSchema);

module.exports = collection;
