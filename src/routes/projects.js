import { Router } from "express";
import { addProject, editProject, getProjectByName, getProjects, removeProject } from "../controllers/projects.js";
import { validateToken } from "../controllers/users.js";
import uploadFields from "../middlewares/upload.js";

export const projectsRouter = Router();


projectsRouter.post('/', validateToken,uploadFields, addProject);
projectsRouter.get('/', getProjects);
projectsRouter.get('/:name', getProjectByName);
projectsRouter.put('/:id',validateToken, uploadFields, editProject);
projectsRouter.delete('/:id', validateToken, removeProject)