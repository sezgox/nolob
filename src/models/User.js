import mongoose from "mongoose";

//projectFields = ['title','description','genre','responsabilities','skills','media','id','links','date'];

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  }
}, { timestamps: false, collection: 'adminuser' });

const User = mongoose.model('User', userSchema);

export default User;