import "dotenv/config"
import mongoose from 'mongoose';

export async function Mongoconnection() {
        try {
                await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/WeddingPhotos");
                console.log("MongoDB connected");
        } catch (error) {
                console.log("MongoDB connection error : ", error);
        }
}
