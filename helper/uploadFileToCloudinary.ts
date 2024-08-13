import { cloudinary } from '../config/cloudinary';
import streamifier from "streamifier";

const streamUpload = (buffer: Buffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ resource_type: 'auto' }, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result.secure_url);
            }
        });

        streamifier.createReadStream(buffer).pipe(stream);
    });
};

const uploadToCloudinary = async (buffer: Buffer) => {
    const result = await streamUpload(buffer);
    return result;
}

export const uploadMultipleFile = async (listFile: Buffer[]): Promise<string[]> => {
    try {
        const result: string[] = [];
        for (const file of listFile) {
            const fileName = await uploadToCloudinary(file);
            result.push(fileName as string);
        }
        return result;
    } catch (error) {
        console.log(error);
        return [];
    }
};

export const uploadSingleFile = async (file: Buffer): Promise<string> => {
    try {
        const fileName = await uploadToCloudinary(file);
        return fileName as string;
    } catch (error) {
        console.log(error);
        return '';
    }
};