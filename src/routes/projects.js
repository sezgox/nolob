import { Router } from "express";
import { addProject, editProject, getProjectByName, getProjects, removeProject } from "../controllers/projects.js";
import { validateToken } from "../controllers/users.js";
import upload from '../middlewares/upload.js';

export const projectsRouter = Router();


projectsRouter.post('/', validateToken, upload.array('media',10), addProject);
projectsRouter.get('/', getProjects);
projectsRouter.get('/:name', getProjectByName);
projectsRouter.put('/:id',validateToken, upload.array('media',10), editProject);
projectsRouter.delete('/:id', validateToken, removeProject)