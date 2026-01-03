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


const uploadOnCloudinary = async (
        localFilePath,
        folder = "misc" //if folder not defined
    ) => {
    try {
        if (!localFilePath) return null;

        const absolutePath = path.resolve(localFilePath);

        const result = await cloudinary.uploader.upload(absolutePath, {
            resource_type: "auto",
            folder
        });

        // cleanup local file
        if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
        }

        return {
            url: result.secure_url,
            public_id: result.public_id
        };

    } catch (error) {
        console.error("Cloudinary upload error:", error);

        if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
        }

        return null;
    }
};

    const deleteFromCloudinary = async (publicId) => {
    if (!publicId) return;

    await cloudinary.uploader.destroy(publicId);
    };

    export {uploadOnCloudinary, deleteFromCloudinary}