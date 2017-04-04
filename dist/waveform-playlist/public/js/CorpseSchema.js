/* jshint esversion: 6 */

module.exports = (mongoose) => {
   var CorpseSchema = new mongoose.Schema({// creates a new mongoose schema called CorpseSchema
      warpName: String,
      trackCount:Number,
      trackFree:Number,
      timeSub:Number,
      bpm:Number,
      admin:String,
      users:Array,
      warp:Array
   });

   var Corpse = mongoose.model('Corpse', CorpseSchema); // create a new model called 'Corpse' based on 'CorpseSchema'

   return Corpse;
};
