import chai from 'chai';
import { GetDownloadsInBoundsRequest, GetMonthlyDownloadsRequest } from '../models/request.models';
import { MIN_TIMESTAMP, MAX_TIMESTAMP } from '../constants/time.constants';

describe('Request Models', () => {

    describe('GetDownloadInBoundsRequest', () => {
        // base parameters as coordinates are necessary
        let baseParams = {
            // both string and float parameters can be defined
            bl_lng: '-32.32',
            bl_lat: -16.16,
            tr_lng: 32.32,
            tr_lat: '16.16'
        };
        // base expect with the coordinates
        let baseExpected = {
            bottomLeft: { long: -32.32, lat: -16.16 },
            topRight: { long: 32.32, lat: 16.16 }
        };

        it('should form a model object without dates', () => {
            let model = new GetDownloadsInBoundsRequest(baseParams);
            chai.assert.deepEqual(model, { ...baseExpected, startDate: new Date(MIN_TIMESTAMP), endDate: new Date(MAX_TIMESTAMP) });
        });

        it('should form a model object with improper dates', () => {
            let model = new GetDownloadsInBoundsRequest({ ...baseParams, startDate: 'startDate', endDate: 'endDate' });
            chai.assert.deepEqual(model, { ...baseExpected, startDate: new Date(MIN_TIMESTAMP), endDate: new Date(MAX_TIMESTAMP) });
        });

        it('should form a model object with proper dates', () => {
            let model = new GetDownloadsInBoundsRequest({ ...baseParams, startDate: 1548344183000, endDate: 1579880189000 });
            chai.assert.deepEqual(model, { ...baseExpected, startDate: new Date(1548344183000), endDate: new Date(1579880189000) });
        });
    });

    describe('GetMonthlyDownloadsRequest', () => {
        let baseParams = {
            year: '2019'
        };

        it('should for a model object with the given string year', () => {
            let model = new GetMonthlyDownloadsRequest(baseParams);
            chai.assert.deepEqual(model, { year: 2019 })
        });
    });
});


