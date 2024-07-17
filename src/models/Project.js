import mongoose from "mongoose";

//projectFields = ['title','description','genre','responsabilities','skills','media','id','links','date'];

const Schema = mongoose.Schema;

const linkSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  }
});

const projectSchema = new Schema({
  title: {
    type: String,
    unique: true,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  genre: {
    type: String,
    required: true
  },
  responsabilities: {
    type: [String],
    default: []
  },
  skills: {
    type: [String],
    default: []
  },
  media: {
    type: [String],
    required: true
  },
  links: {
    type: [linkSchema],
    required: true
  },
  others:{
    type: [String],
    required: false
  },
  file:{
    type: String,
    required: false
  },
  date: {
    type: String,
    required: true
  }
}, { timestamps: true, collection: 'noloprojects' });

const Project = mongoose.model('Project', projectSchema);

export default Project;