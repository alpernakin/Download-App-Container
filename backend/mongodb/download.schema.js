import mongoose, { Schema } from "mongoose";
/** define the schema for the collection */
var downloadSchema = new Schema({
    /**
     * indexed geo spatial point location
     * indexed due to the geo spatial queries to find out downloads in a certain area
     */
    location: {
        type: { type: Schema.Types.String, enum: ['Point'], required: true },
        // [<longitude>, <latitude>]
        // https://docs.mongodb.com/manual/geospatial-queries/#legacy-coordinate-pairs
        coordinates: { type: [Schema.Types.Number], required: true }
    },

    /** 
     * the application ID
     */
    app_id: { type: Schema.Types.String, required: true },

    /** 
     * indexed due to the map queries by period and periodic statistics
     * MongoDB stores date objects as bson 64bit Int timestamp in UTC
     */
    downloaded_at: { type: Schema.Types.Date, required: true },

    /**
     * local timezone where the client downloaded
     * for example: 'Europe/Berlin'
     * please see assets/timezones.js
     */
    local_timezone: { type: Schema.Types.String, required: true, default: 'Europe/Berlin' },

    /**
     * country iso code: https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes
     * for example: IT for Italy, please see assets/countries.js
     */
    country_code: { type: Schema.Types.String, required: true }
});
// for compound indexes and query support
// https://docs.mongodb.com/manual/tutorial/create-indexes-to-support-queries/
// https://docs.mongodb.com/manual/core/index-compound/#index-type-compound
// geo spatial index over location field
downloadSchema.index({ location: '2dsphere', downloaded_at: -1 });
// export the model
export default mongoose.model('Downloads', downloadSchema);