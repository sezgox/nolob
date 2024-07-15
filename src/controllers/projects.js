import cloudinary from '../client/cloudinaryConfig.js';
import Project from "../models/Project.js";




export const addProject = async (req,res) => {
    if(req.body.project){
        const project = JSON.parse(req.body.project);
        if(!project.title || !project.description || !project.genre || !project.links ||  !req.files){
            return res.json({data:'Unvalid data',success:false})
        }
        project.media = []
        try {
            const uploadPromises = req.files.map(file => {
                const uploadConfig = {
                    resource_type: 'auto',
                    public_id: file.originalname.split('.')[0],
                    chunk_size: 60000000,
                    format: 'webp',
                    transformation: [
                        {quality: "auto"},
                        {fetch_format: "webp"}
                    ],
                };
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.v2.uploader.upload_stream(uploadConfig, (error, result) => {
                        if (error) {
                            reject(error); // Rechazar la promesa si hay un error
                        } else {
                            project.media.push(result.secure_url); // Agregar la URL al proyecto
                            resolve(); // Resolver la promesa cuando se complete la carga
                        }
                    });
                    stream.end(file.buffer); // Pasar el buffer de la imagen
                });
            });

            // Esperar a que todas las promesas de carga se resuelvan
            await Promise.all(uploadPromises);
            const newProject = new Project(project);
            const savedProject = await newProject.save();
            res.json( {data: {savedProject,msg:'Proyecto añadido'}, success: true} )
        } catch (error) {
            res.json({data:'Something went wrong... Try again later.', success:false})
            console.log(error)
        }
    }else{
        return res.json({data:'Unvalid data', success:false})
    }
}
export const getProjects = async (req,res) => {

    try {
        const projects = await Project.find();
        res.json({ success: true, data: projects });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener proyectos', error });
    }

}

export const getProjectByName = async (req,res) => {
    try {
        const encodedName = req.params.name;
        const name = decodeURIComponent(encodedName);

        const project = await Project.findOne({ title: name });

        if (!project) {
            return res.status(404).json({ success: false, data: 'Project not found' });
        }

        res.json({ success: true, data: project });
    } catch (error) {
        res.status(500).json({ success: false, data: 'Error retrieving project', error });
    }
}

export const removeProject = async (req,res) => {
    const {id} = req.params;
    try {
        const project = await Project.findByIdAndDelete(id);

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        const deletePromises = project.media.map(imageUrl => {
            // Extraer el public_id de la URL de Cloudinary
            const publicId = imageUrl.split('/').pop().split('.')[0]; 
            return cloudinary.v2.uploader.destroy(publicId, { resource_type: 'auto' });
        });

        // Esperar a que todas las promesas de eliminación se resuelvan
        await Promise.all(deletePromises);

        res.json({ success: true, message: 'Project successfully deleted' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Error deleting project', error });
    }
}

export const editProject = async (req,res) => {
    const {id} = req.params
    if(req.body.project){
        const project = JSON.parse(req.body.project);
        if(!project || !project._id ){
            return res.json({data:'Unvalid data',success:false})
        }
        try {
            const existingProject = await Project.findById(id);
            if (!existingProject) {
                return res.status(404).json({ data: 'Project not found', success: false });
            }
            /* SUBIR IMAGENES */
            const uploadPromises = req.files.map(file => {
                const uploadConfig = {
                    resource_type: 'auto',
                    public_id: file.originalname.split('.')[0],
                    format: 'webp',
                    chunk_size: 60000000,
                    transformation: [
                        {quality: "auto"},
                        {fetch_format: "webp"}
                    ]
                };
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.v2.uploader.upload_stream(uploadConfig, (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result.secure_url); // Resolver la promesa con la URL de la imagen
                        }
                    });
                    stream.end(file.buffer);
                });
            });

            const newImageUrls = await Promise.all(uploadPromises);
            existingProject.media.push(...newImageUrls);
            const existingImageNames = existingProject.media.map(url => {
                const parts = url.split('/');
                return parts[parts.length - 1]; // Obtener solo el nombre del archivo
            });

            let imagesToDelete = [];
            let conserve = [];
            for(let img of project.media){
                conserve.push(img.split('/')[img.split('/').length-1])
            }
            for(let name of existingImageNames){
                if(!conserve.includes(name)){
                    imagesToDelete.push(name)
                }
            }
            console.log('A BORRAR: ' + imagesToDelete)
            const deletePromises = imagesToDelete.map(imageName => {
                const public_id = imageName.split('.')[0]; // Obtener el public_id (nombre sin extensión)
                return cloudinary.v2.uploader.destroy(public_id);
            });
            await Promise.all(deletePromises);
            existingProject.title = project.title;
            existingProject.description = project.description;
            existingProject.genre = project.genre;
            existingProject.links = project.links;
            existingProject.responsabilities = project.responsabilities;
            existingProject.skills = project.skills;
            existingProject.media = existingProject.media.filter(url => !imagesToDelete.includes(url.split('/').pop())); // Actualizar media
            console.log(existingProject.media)

            await existingProject.save();
            res.json({ data: { existingProject, msg: 'Project updated successfully' }, success: true });
        } catch (error) {
            res.status(500).json({ data: 'Something went wrong... Try again later.', success: false, error });
            console.error(error);
        }
    }else{
        return res.json({data:'Unvalid data',success:false})
    }
    
}