import cloudinary from '../client/cloudinaryConfig.js';
import Project from "../models/Project.js";



function uploadFile(file) {
    const uploadConfig = {
        resource_type: 'auto',
        public_id: file.originalname.split('.')[0],
        overwrite: true
    };
    return new Promise((resolve, reject) => {
        const stream = cloudinary.v2.uploader.upload_stream(uploadConfig, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result.secure_url);
            }
        });
        stream.end(file.buffer);
    });
}


export const addProject = async (req,res) => {
    if(req.body.project){
        const project = JSON.parse(req.body.project);
        if(!project.title || !project.date){
            return res.json({data:'Unvalid data',success:false})
        }
        project.media = []
        try {
            const uploadPromises = req.files.media.map(file => uploadFile(file));
            project.media = await Promise.all(uploadPromises);

            if(req.files.files){
                const uploadFilePromise = uploadFile(req.files.files[0]);
                project.file = await uploadFilePromise;
            }

            const newProject = new Project(project);
            const savedProject = await newProject.save();
            res.json( {data: {savedProject,msg:'Proyecto añadido'}, success: true} )
        } catch (error) {
            res.json({data:{msg: 'Something went wrong... Try again later.',error: req.files}, success:false})
            console.log(error)
        }
    }else{
        return res.json({data:'Unvalid data', success:false})
    }
}
export const getProjects = async (req,res) => {

    try {
        const projects = await Project.find().sort({ date: -1 });
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

        const deleteImagePromises = project.media.map(imageUrl => {
            // Extraer el public_id de la URL de Cloudinary
            const publicId = imageUrl.split('/').pop().split('.')[0]; 
            return cloudinary.v2.uploader.destroy(publicId, { resource_type: 'image' });
        });

        let deleteFilePromise;
        if(project.file){
            const filePublicId = project.file.split('/').pop().split('.')[0];
            deleteFilePromise = cloudinary.v2.uploader.destroy(filePublicId, { resource_type: 'raw' });
        }

        await Promise.all([...deleteImagePromises, deleteFilePromise]);

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
            
            for(let key in project){
                existingProject[key] = project[key]
            }

            let  newImageUrls;
            if(req.files.media){
                const uploadPromises = req.files.media.map(file => uploadFile(file));
                newImageUrls = await Promise.all(uploadPromises);
                existingProject.media.push(...newImageUrls);
            }

            if(req.files.files){
                const uploadFilePromise = uploadFile(req.files.files[0]);
                existingProject.file = await uploadFilePromise;
            }

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
            const deletePromises = imagesToDelete.map(imageName => {
                const public_id = imageName.split('.')[0]; // Obtener el public_id (nombre sin extensión)
                return cloudinary.v2.uploader.destroy(public_id);
            });

            await Promise.all(deletePromises);
            existingProject.media = existingProject.media.filter(url => !imagesToDelete.includes(url.split('/').pop())); // Actualizar media

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