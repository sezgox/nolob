import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export class Datafile {
    projectFields = ['title','description','genre','responsabilities','skills','media','id','links','date'];

    constructor() {
        // Convierte la URL del módulo en una ruta de archivo
        const __filename = fileURLToPath(import.meta.url);
        // Obtén el directorio del archivo
        const __dirname = path.dirname(__filename);
        // Define la ruta al archivo JSON
        this.filePath = path.join(__dirname, 'data.json');
        this.dir = __dirname;
    }

    readJsonFile(filePath) {
        try {
            // Lee el contenido del archivo
            const jsonData = fs.readFileSync(filePath, 'utf-8');
            // Parsea el contenido como JSON
            return JSON.parse(jsonData);
        } catch (error) {
            console.error(`Error reading JSON file from ${filePath}:`, error);
            return null;
        }
    }

    writeJsonFile(filePath, data) {
        try {
            const jsonData = JSON.stringify(data, null, 2);
            // Escribe el contenido JSON en el archivo
            fs.writeFileSync(filePath, jsonData, 'utf-8');
        } catch (error) {
            console.error(`Error writing JSON file to ${filePath}:`, error);
        }
    }

    getProjects() {
        const data = this.readJsonFile(this.filePath);
        if (data && data.projects.length > 0) {
            const projects = data.projects;
            return { data: projects, success: true };
        } else {
            return { data: 'No hay proyectos todavía', success: false };
        }
    }

    addProject(newProject) {
        const data = this.readJsonFile(this.filePath);
        let project = {};
        if (data) {
            for(let key in newProject){
                if(this.projectFields.includes(key)){
                    project[key] = newProject[key];
                }
            }
            data.projects.push(project);
            data.projects.sort((a, b) => {
                return new Date(a.date) - new Date(b.date);
            });
            this.writeJsonFile(this.filePath, data);
            return { data: {project,msg:'Proyecto añadido'}, success: true };
        } else {
            return { data: 'Error añadiendo proyecto', success: false };
        }
    }

    getProjectByName(name){
        const data = this.readJsonFile(this.filePath);
        if(data && data.projects){
            const project = data.projects.find(project => project.title == name);
            if(project){
                return { data:project,success:true }
            }else{
                return { data:'Proyecto no encontrado',success:false }
            }
        }else{
            return { data: 'Proyecto no encontrado', success: false };
        }
    }

    removeProject(id){
        const data = this.readJsonFile(this.filePath);
        if(data && data.projects){
            const filteredProjects = data.projects.filter(project => project.id != id);
            data.projects = filteredProjects;
            this.writeJsonFile(this.filePath,data);
            try {
                const uploadPath = path.join(this.dir, '..', 'uploads', id);
                if(fs.existsSync(uploadPath)){
                    fs.rmSync(uploadPath, {recursive: true, force: true});
                    return {data:'Proyecto eliminado...',success:true}
                }else{
                    return {data:'Carpeta imágenes no encontrada... (proyecto eliminado)',success:false}
                }
            } catch (error) {
                return { data: 'Carpeta imágenes no eliminada... (proyecto eliminado)', success: false };
            }
        }else{
            return { data: 'Proyecto no encontrado', success: false };
        }
    }

    updateProject(newInfo){
        const data = this.readJsonFile(this.filePath);
        this.removeUnusedImages(newInfo)
        if(data && data.projects){
            const index = data.projects.findIndex(project => project.id == newInfo.id);
            if(index >= 0){
                for(let key in newInfo){
                    if(this.projectFields.includes(key) && key != 'id' && data.projects[index][key] != newInfo[key]){
                        data.projects[index][key] = newInfo[key];
                    }
                }
                data.projects.sort((a, b) => {
                    return new Date(a.date) - new Date(b.date);
                  });
                this.writeJsonFile(this.filePath,data);
                return {data:`Proyecto "${data.projects[index].title}" actualizado`,success: true}
            }else{
                return {data:'Proyecto no encontrado', success: false}
            }
        }else{
            return { data: 'Proyecto no encontrado', success: false };
        }
    }

    removeUnusedImages(project){
        const mediaDir = path.join(this.dir,'..','uploads',project.id);
        const images = fs.readdirSync(mediaDir)
        for(let img of images){
            if(!project.media.images.includes(img)){
                const filePath = path.join(mediaDir, img);
                fs.unlink(filePath, err => {
                    if (err) {
                        console.error('Error al eliminar el archivo:', img, err);
                    } else {
                        console.log('Archivo eliminado:', img);
                    }
                });
            }
        }
    }

    getUser(){
        const data = this.readJsonFile(this.filePath);
        if(data && data.user){
            return {data:data.user,success:true}
        }else{
            return {data:'Error leyendo usuario administrador',success:false}
        }
    }

}

