import { v2 as cloudinary } from 'cloudinary'; 

 // Configuration
 cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API__SECRET_KEY// Click 'View API Keys' above to copy your API secret
});
 
 const uploadImageClodinary = async(image)=>{

    //if image.buffer is available then send it in the variable buffer and if not available then convert the image in the form of buffer
    const buffer  = image?.buffer || Buffer.from(await image.arrayBuffer())

    const uploadImage = await new Promise((resolve,reject)=>{
        cloudinary.uploader.upload_stream({folder:"BlinkitApp"},(error,uploadResult)=>{
            return resolve(uploadResult)
        }).end(buffer)
    })

    return  uploadImage
 }


 export default uploadImageClodinary  