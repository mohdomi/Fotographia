<<<<<<< HEAD
import { v2 as cloudinary } from 'cloudinary';
import { config } from 'dotenv';
config();
 cloudinary.config({ 
    cloud_name:process.env.CLOUD_NAME, 
    api_key:process.env.CLOUD_KEY, 
    api_secret:process.env.CLOUD_SECRET // Click 'View API Keys' above to copy your API secret
});

export default cloudinary;
=======
// import 'dotenv/config';
// import { v2 as cloudinary } from 'cloudinary';

// console.log(process.env.CLOUD_NAME);
// console.log(process.env.API_KEY);
// console.log(process.env.API_SECRET);



// cloudinary.config({ 
//     cloud_name: process.env.CLOUD_NAME, 
//     api_key: process.env.API_KEY, 
//     api_secret: process.env.API_SECRET
// });

// export default cloudinary;



/* no scalable so removed it just used temporarily for testing
still keeping the code for just in case. */
>>>>>>> 028c7cc43012e4980aab5f9a0735277e1c4f0eb1
