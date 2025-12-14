import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from "path";
import dotenv from "dotenv"
dotenv.config();




 // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });


    const uploadOnCloudinary = async (localFilePath) => {
        try {
            if (!localFilePath) return null;

            const filePath = path.resolve(localFilePath);

            const response = await cloudinary.uploader.upload(filePath, {
            resource_type: "auto",
            });

            // DELETE LOCAL FILE AFTER SUCCESS
            fs.unlinkSync(filePath);

            return response;

        } catch (error) {
            console.log("Cloudinary upload error:", error);

            // DELETE LOCAL FILE IF FAILED
            fs.unlinkSync(localFilePath);

            return null;
        }
    }

    export {uploadOnCloudinary}