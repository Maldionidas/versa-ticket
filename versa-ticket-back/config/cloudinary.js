const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
//credenciales par cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
//configuración de multer para subir a cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'versa_ticket_evidencias', // Carpeta en Cloudinary donde se guardarán las imágenes
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'], // Formatos permitidos
    },
});

module.exports = {
    cloudinary,
    storage
};