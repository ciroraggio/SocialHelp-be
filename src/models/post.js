const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: { type: String, required: true },
  imageUrl: { type: String },
  solved: { type: Boolean, default: false },
  resolver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, 
{
  // aggiungerà automaticamente due campi al documento: createdAt e updatedAt. 
  // Questi campi conterranno la data e l'ora della creazione e dell'ultima modifica del documento.
  timestamps: true,
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
