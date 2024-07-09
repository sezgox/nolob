
import { Datafile } from "../models/datafile.js";

const datafile = new Datafile();
/* 
const mediaPath = 'http://localhost:3002/uploads/'; */


const mediaPath = 'hhttps://nolob.onrender.com/';

export const addProject = (req,res) => {
    if(req.body.project){
        const project = JSON.parse(req.body.project);
        if(!project.title || !project.description || !project.genre || !project.links ||  !req.files){
            return res.json({data:'Unvalid data',success:false})
        }
        project.media = {
            mediaPath : `${mediaPath}${project.id}/`,
            images: []
        }
        for(let file of req.files){
            project.media.images.push(file.originalname);
        }
        const result = datafile.addProject(project);
        res.json(result)
    }else{
        return res.json({data:'Unvalid data', success:false})
    }
}

export const getProjects = (req,res) => {
    //const result = await projectModel.getAll();
    const result = datafile.getProjects();
    res.json(result);
}

export const getProjectByName = (req,res) => {
    const encodedName = req.params.name;
    const name = decodeURIComponent(encodedName);
    const result = datafile.getProjectByName(name);
    res.json(result);
}

export const removeProject = (req,res) => {
    const {id} = req.params;
    const result = datafile.removeProject(id);
    res.json(result);
}

export const editProject = (req,res) => {
    if(req.body.project){
        const project = JSON.parse(req.body.project);
        if(!project || !project.id ){
            return res.json({data:'Unvalid data',success:false})
        }
        const result = datafile.updateProject(project);
        res.json(result);
    }else{
        return res.json({data:'Unvalid data',success:false})
    }
    
}