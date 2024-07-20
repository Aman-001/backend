import { v2 as cloudinary } from "cloudinary"
import fs from "fs"


// Configuration
cloudinary.config({
    cloud_name: process.env.
        Cloudinary_cloud_name,
    api_key: process.env.Cloudinary_API_key,
    api_secret: process.env.Cloudinary_API_secret
});

const UploadOnCloudinary = async (LocalFilePath) => {
    try {
        if(!LocalFilePath)
            return null;
        //Upload on Cloudinary
        const response = await cloudinary.uploader.upload(LocalFilePath , {resource_type:"auto"})
        //Uploaded Sucessfully
       // console.log("UPLOADED ON CLOUDINARY" , response.url);
       fs.unlinkSync(LocalFilePath)

       return response;
       
    } catch (error) {
        //Removes the temp saved file on the server 
        fs.unlink(LocalFilePath);
        return null;
    }
} 

export {UploadOnCloudinary}