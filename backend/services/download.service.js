import { DownloadResultItem, KeyValuePair } from '../models/response.models.js';
import countries from '../assets/countries.js';
import { GetDownloadsInBoundsRequest, GetMonthlyDownloadsRequest } from '../models/request.models.js';
import downloadModelInstance from '../mongodb/download.schema.js';
import queryBuilder from './helpers/download.query.builder.js';
import timeHelper from './helpers/time.helper.js';

export class DownloadService {

    constructor(downloadModel) {
        this.model = downloadModel;

        this.streamChangeOn = this.streamChangeOn.bind(this);

        this.getInBounds = this.getInBounds.bind(this);
        this.getMonthly = this.getMonthly.bind(this);
        this.getByCountry = this.getByCountry.bind(this);
        this.getByTimeOfDay = this.getByTimeOfDay.bind(this);
    }

    /**
     * streams download data with the given event id for specific operation
     * @param {*} io socket server
     * @param {*} acceptedOperationType database the operation made on the data
     * @param {*} eventId the event id in string to emit the data on
     */
    async streamChangeOn(io, acceptedOperationType, eventId) {
        try {
            // mongodb change streams require replica or sharding sets
            // https://docs.mongodb.com/manual/changeStreams/
            this.model.watch().on('change', (data) => {
                if (data.operationType === acceptedOperationType)
                    io.sockets.emit(eventId,
                        new DownloadResultItem(data.fullDocument));
            });

            // something that would be added in the future: emit stream data based on socket client necessity

            return true;
        }
        catch (err) {
            console.log("[Download.Service.StreamChangeOn]");
            console.log(err);
            // TODO use logger to log errors!
            throw err;
        }
    }

    /**
     * returns downloads in the given bounds and period
     * @param {*} bounds polygonal bounds of the map
     * @param {*} startDate unix timestamp in ms
     * @param {*} endDate unix timestamp in ms
     */
    async getInBounds(params) {
        try {
            let data = new GetDownloadsInBoundsRequest(params);

            let query = queryBuilder.createInBoundsQuery(
                [data.bottomLeft.long, data.bottomLeft.lat],
                [data.topRight.long, data.topRight.lat],
                data.startDate,
                data.endDate);
            // query the items
            let queryResult = await this.model.find(query).exec();
            // map the result
            let downloads = queryResult ? queryResult.map(item => new DownloadResultItem(item)) : [];

            return downloads;
        }
        catch (err) {
            console.log("[Download.Service.GetInBounds]");
            console.log(err);
            // TODO use logger to log errors!
            throw err;
        }
    }

    /** 
     * returns download numbers by month of a year
     * returns statistics entry key and value 
     */
    async getMonthly(params) {
        try {
            let data = new GetMonthlyDownloadsRequest(params);

            let queryResult = await this.model
                .aggregate(queryBuilder.createMonthlyAggregateQuery(data.year))
                .sort({ _id: 1 }).exec();

            return queryResult ? queryResult.map(item => new KeyValuePair(item._id, item.total)) : [];
        }
        catch (err) {
            console.log("[Download.Service.GetMonthly]");
            console.log(err);
            // TODO use logger to log errors!
            throw err;
        }
    }

    /** returns statistics entry with key and value */
    async getByCountry() {
        try {
            let queryResult = await this.model
                .aggregate(queryBuilder.createByCountryAggregateQuery())
                .sort({ total: -1 }).exec();

            return queryResult ? queryResult.map(item => new KeyValuePair(countries[item._id], item.total)) : [];
        }
        catch (err) {
            console.log("[Download.Service.GetByCountry]");
            console.log(err);
            // TODO use logger to log errors!
            throw err;
        }
    }

    /** returns statistics entry with key and value */
    async getByTimeOfDay() {
        try {

            let queryResult = await this.model
                .aggregate(queryBuilder.createByTimeAggregateQuery([0, 12, 16, 19, 24]))
                .sort({ total: -1 }).exec();

            // map the result 
            return queryResult ? queryResult.map(item => new KeyValuePair(timeHelper.getTimeOfDay(item._id), item.total)) : [];
        }
        catch (err) {
            console.log("[Download.Service.GetByTimeOfDay]");
            console.log(err);
            // TODO use logger to log errors!
            throw err;
        }
    }
}
export const serviceInstance = new DownloadService(downloadModelInstance);