import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
	
	pin : String,
	weddingId : {
		type : mongoose.Schema.Types.ObjectId,
		ref : "Wedding"
	},
	interactions: [
		{
			categoryId: {
				type : mongoose.Schema.Types.ObjectId,
				ref : "Category"
			},
			// according to this clicked image i could check the threshhold for next unlock using some clickedImages.length == categoryThreshhold
			clickedImages : [
				{
					imageId : {
						type : mongoose.Schema.Types.ObjectId,
						ref : "Image"
					}
				}
			]
		}
	]

})

const User = mongoose.model('User' , userSchema);
export default User

