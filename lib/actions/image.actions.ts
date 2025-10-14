"use server";

import { revalidatePath } from "next/cache";
import Image from "../database/models/image.model";
import User from "../database/models/user.model";
import { connectToDatabase } from "../database/mongodb";
import { handleError } from "../utils";
import { redirect } from "next/navigation";
import { v2 as cloudinary } from 'cloudinary';

const populateUser = (query: any) => query.populate({
    path: 'author',
    model: User,
    select: '_id firstName lastName',
})
export const addImage = async ({ userId, image, path }: AddImageParams) => {
    try {
        await connectToDatabase();
        const author = await User.findById(userId);
        if (!author) throw new Error('user not found...');

        const Userimage = await Image.create({ ...image, author: author._id });

        revalidatePath(path);
        return JSON.parse(JSON.stringify(Userimage));
    } catch (error) {
        handleError(error);
    }
}

export const updateImage = async ({ userId, image, path }: UpdateImageParams) => {
    try {
        await connectToDatabase();
        const ImageToUpdate = await Image.findById(image._id);

        if (!ImageToUpdate || ImageToUpdate.author.toHexString() !== userId) {
            throw new Error('Unauthorized or image not found');
        }

        const UpdateImage = await Image.findByIdAndUpdate(image, ImageToUpdate._id, { new: true });

        revalidatePath(path);
        return JSON.parse(JSON.stringify(UpdateImage));
    } catch (error) {
        handleError(error);
    }
}

export const DeleteImage = async (imageId: string) => {
    try {
        await connectToDatabase();

        await Image.findByIdAndDelete(imageId);

    } catch (error) {
        handleError(error);
    } finally {
        redirect('/');
    }
}

export const getImageByid = async (imageId: string) => {
    try {
        await connectToDatabase();
        const imageByid = await populateUser(Image.findById(imageId));

        if (!imageByid) {
            throw new Error('image not found');
        }

        return JSON.parse(JSON.stringify(imageByid));
    } catch (error) {
        handleError(error);
    }
}

export const getAllImages = async ({ limit = 9, page = 1, searchQuery = '' }: { limit?: number, page: number, searchQuery: string }) => {
    try {
        await connectToDatabase();

        cloudinary.config({
            cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            secure: true,
        })

        let expression = 'folder=ai_image';

        if (searchQuery) {
             expression += ` AND ${searchQuery}`
        }

        const { resources } = await cloudinary.search.expression(expression).execute();
        const resourceIds = resources.map((resource: any) => resource.public_id);

        let query = {};
        if (searchQuery) {
            query = {
                publicId: {
                    $in: resourceIds,
                }
            }
        }

        const skipAmounts = (Number(page) - 1) * limit;
        const images = await populateUser(Image.find(query)).sort({ updatedAt: -1 }).skip(skipAmounts).limit(limit);

        const totalImages = await Image.find(query).countDocuments();
        const savedImages = await Image.find().countDocuments();

        return {
            data: JSON.parse(JSON.stringify(images)),
            totalPage: Math.ceil(totalImages / limit),
            savedImages,
        }
    } catch (error) {
        handleError(error);
    }
} 