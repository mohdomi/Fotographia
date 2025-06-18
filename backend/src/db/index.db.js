import mongoose from 'mongoose';


async function MongoDB(){

        try{

            await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/WeddingPhotos");


        }catch(error){

                console.log("MongoDB connection error : " , error);

        }

}