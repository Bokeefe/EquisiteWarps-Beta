/* jshint esversion: 6 */

module.exports = (mongoose) => {
   var CorpseSchema = new mongoose.Schema({// creates a new mongoose schema called CorpseSchema
      warpName: String,
      numCont:Number,
      trackFree:Boolean,
      timeSub:Number,
      bpm:Number,
      admin:String,
      users:Array,
      message:String,
      warp:Array
   });

   var Corpse = mongoose.model('Corpse', CorpseSchema); // create a new model called 'Corpse' based on 'CorpseSchema'

   return Corpse;
};
