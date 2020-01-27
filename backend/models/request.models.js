import { MAX_TIMESTAMP, MIN_TIMESTAMP } from "../constants/time.constants.js";

export class GetDownloadsInBoundsRequest {
    /**
     * @param {*} params.bl_lng south west longitude
     * @param {*} params.bl_lat south west latitude
     * @param {*} params.tr_lng north east longitude
     * @param {*} params.tr_lat north east latitude
     * @param {*} params.starDate unix timestamp
     * @param {*} params.endDate unix timestamp
     */
    constructor(params) {
        this.bottomLeft = { long: parseFloat(params.bl_lng), lat: parseFloat(params.bl_lat) };
        this.topRight = { long: parseFloat(params.tr_lng), lat: parseFloat(params.tr_lat) };

        let isNumeric = (value) => !isNaN(parseFloat(value)) && isFinite(value);
        // if the date inputs exist and they are numeric values
        // then convert them to the date objects
        // otherwise take max and min dates
        let startDateTimestamp = params.startDate && isNumeric(params.startDate) ?
            Math.round(parseFloat(params.startDate)) : MIN_TIMESTAMP;
        let endDateTimestamp = params.endDate && isNumeric(params.endDate) ?
            Math.round(parseFloat(params.endDate)) : MAX_TIMESTAMP;

        this.startDate = new Date(startDateTimestamp);
        this.endDate = new Date(endDateTimestamp);
    }
}

export class GetMonthlyDownloadsRequest {

    /**
     * @param {*} params.year
     */
    constructor(params) {

        this.year = parseInt(params.year)
    }
}