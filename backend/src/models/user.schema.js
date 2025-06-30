import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
	
	Userpin : {
		type:String,
		required:true
	},


	weddingId :{
		type : mongoose.Schema.Types.ObjectId,
		ref : "Projects"
	},

  Access: [{
    type:mongoose.Schema.Types.ObjectId,
    ref:"AccessUser"
  }],

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

const ClientUser = mongoose.model('ClientUser' , userSchema);
export default ClientUser

