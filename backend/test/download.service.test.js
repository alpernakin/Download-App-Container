import td from 'testdouble';
import chai from 'chai';
import { DownloadService } from '../services/download.service';
import { MIN_TIMESTAMP, MAX_TIMESTAMP } from '../constants/time.constants';
import { DownloadResultItem, KeyValuePair } from '../models/response.models';
import queryBuilder from '../services/helpers/download.query.builder';
import countries from '../assets/countries';
import timeHelper from '../services/helpers/time.helper';

/**
 * Fake executable Mongo Document Model for querying data
 */
class FakeExecutableMongoModel {
    constructor(data) {
        this.data = data;
    }
    sort() {
        // no need to test mongoose model sort function
        return this;
    }
    async exec() {
        // simplly return data after async process
        return this.data;
    }
}

/**
 * Fake observable Mongo Document Model for data streaming
 */
class FakeObservableMongoModel {
    constructor(data) {
        this.data = data;
    }
    // event expected as 'change'
    on(_event = 'change', callback) {

        if (_event !== 'change')
            throw new Error('invalid event for data streaming');

        Promise.resolve({
            fullDocument: this.data,
            operationType: 'insert'
        }).then(data => callback(data));
    }
}

/**
 * Fake Socket IO model
 */
class FakeIOModel {
    constructor() {
        this.dataToEmit = null;
        this.sockets = {
            emit: (_eventId, data) => {
                this.dataToEmit = data;
            }
        };
    }
    async readEmittedData() {
        return this.dataToEmit;
    }
}

describe('DownloadService', () => {

    it('should instantiate the model', () => {
        let downloadModelSpy = {
            find: td.function()
        };

        let downloadService = new DownloadService(downloadModelSpy);
        chai.assert.deepEqual(downloadService.model, downloadModelSpy);
    })

    describe('streamChangeOn', () => {
        let downloadModelSpy = {
            watch: td.function()
        };

        let streamDataItem = {
            app_id: "app_id",
            downloaded_at: "downloaded_at",
            location: { type: 'Point', coordinates: [3, 3] }
        };
        // the expected data from service method
        let expectedData = new DownloadResultItem(streamDataItem);

        it('should stream data from database', () => {
            // stub the model
            td.when(downloadModelSpy.watch()).thenReturn(new FakeObservableMongoModel(streamDataItem));
            // create a service with the spy model
            let downloadService = new DownloadService(downloadModelSpy);
            // create a fake socket io model
            let io = new FakeIOModel();
            // run the test
            downloadService.streamChangeOn(io, 'insert', 'download_new_data').then(_ => {
                io.readEmittedData().then(_ioStreamData => chai.assert.deepEqual(_ioStreamData, expectedData))
            });
        });
    });

    describe('getInBounds', () => {
        let downloadModelSpy = {
            find: td.function()
        };

        // dummy mongo model response item
        let resultItem = {
            app_id: "app_id",
            downloaded_at: "downloaded_at",
            location: { type: 'Point', coordinates: [3, 3] }
        }
        // the expected data from spy mongoose model
        let modelData = [resultItem];
        // the expected data from service method
        let expectedData = [new DownloadResultItem(resultItem)];
        // fake parameters
        let baseParameters = { bl_lng: 1, bl_lat: 2, tr_lng: 5, tr_lat: 4 };

        describe('without dates', () => {

            it('should return downloads in the specified bounds (map box) without any timestamp parameter', () => {
                let query = queryBuilder.createInBoundsQuery([1, 2], [5, 4], new Date(MIN_TIMESTAMP), new Date(MAX_TIMESTAMP));
                // stub the model with the given parameter set
                td.when(downloadModelSpy.find(query)).thenReturn(new FakeExecutableMongoModel(modelData));
                // create a service with the stub model
                let downloadService = new DownloadService(downloadModelSpy);
                // run the test
                return downloadService.getInBounds(baseParameters)
                    .then(data => chai.assert.deepEqual(data, expectedData));
            });
        });

        describe('with dates', () => {

            it('should return downloads in specified bounds (map box) with proper timestamp parameters', () => {
                let query = queryBuilder.createInBoundsQuery([1, 2], [5, 4], new Date(1548344183000), new Date(1579880189000));
                // stub the model with the given parameter set
                td.when(downloadModelSpy.find(query)).thenReturn(new FakeExecutableMongoModel(modelData));
                // create a service with the stub model
                let downloadService = new DownloadService(downloadModelSpy);
                // params with dates *****
                let params = { ...baseParameters, startDate: 1548344183000, endDate: 1579880189000 }
                // run the test
                return downloadService.getInBounds(params)
                    .then(data => chai.assert.deepEqual(data, expectedData));
            });

            it('should return downloads in specified bounds (map box) with improper timestamp parameters (random string)', () => {
                let query = queryBuilder.createInBoundsQuery([1, 2], [5, 4], new Date(MIN_TIMESTAMP), new Date(MAX_TIMESTAMP));
                // stub the model with the given parameter set
                td.when(downloadModelSpy.find(query)).thenReturn(new FakeExecutableMongoModel(modelData));
                // create a service with the stub model
                let downloadService = new DownloadService(downloadModelSpy);
                // params with dates *****
                let params = { ...baseParameters, startDate: 'something', endDate: "another thing" }
                // run the test
                return downloadService.getInBounds(params)
                    .then(data => chai.assert.deepEqual(data, expectedData));
            });
        });
    });

    describe('getMonthly', () => {
        let downloadModelSpy = {
            aggregate: td.function()
        };
        // the expected data from spy mongoose model
        let modelData = [{ _id: 2, total: 124 }, { _id: 1, total: 123 }];
        // the expected data from service method
        let expectedData = modelData
            // expected type
            .map(x => new KeyValuePair(x._id, x.total))
            // expected sort
            .sort((x, y) => y.key - x.key);
        // fake parameters
        let year = 2019;

        it('should return download numbers for months, which have download count with the given year & sorted by month index', () => {
            // stub the model with the given parameter
            td.when(downloadModelSpy.aggregate(queryBuilder.createMonthlyAggregateQuery(year)))
                .thenReturn(new FakeExecutableMongoModel(modelData));
            // create a service with the stub model
            let downloadService = new DownloadService(downloadModelSpy);
            // accepts year param in string
            let params = { year: year.toString() }
            // run the test
            return downloadService.getMonthly(params)
                .then(data => chai.assert.deepEqual(data, expectedData));
        });
    });

    describe('getByCountry', () => {
        let downloadModelSpy = {
            aggregate: td.function()
        };
        // the expected data from spy mongoose model
        let modelData = [{ _id: "IT", total: 25 }, { _id: "DE", total: 23 }, { _id: "TR", total: 20 }];
        // the expected data from service method
        let expectedData = modelData
            // expected type
            .map(x => new KeyValuePair(countries[x._id], x.total))
            // expected sort
            .sort((x, y) => y.value - x.value);

        it('should return download numbers by country & sorted by the number of downloads', () => {
            // stub the model with the given parameter
            td.when(downloadModelSpy.aggregate(queryBuilder.createByCountryAggregateQuery()))
                .thenReturn(new FakeExecutableMongoModel(modelData));
            // create a service with the stub model
            let downloadService = new DownloadService(downloadModelSpy);
            // run the test
            return downloadService.getByCountry()
                .then(data => chai.assert.deepEqual(data, expectedData));
        });
    });

    describe('getByTimeOfDay', () => {
        let downloadModelSpy = {
            aggregate: td.function()
        };
        // the expected data from spy mongoose model
        let modelData = [{ _id: 16, total: 25 }, { _id: 0, total: 23 }, { _id: 12, total: 15 }, { _id: 19, total: 13 }];
        // the expected data from service method
        let expectedData = modelData
            // expected type
            .map(x => new KeyValuePair(timeHelper.getTimeOfDay(x._id.toString()), x.total))
            // expected sort
            .sort((x, y) => y.value - x.value);

        it('should return download numbers by time of day & sorted by the number of downloads', () => {
            // stub the model with the given parameter
            td.when(downloadModelSpy.aggregate(queryBuilder.createByTimeAggregateQuery([0, 12, 16, 19, 24])))
                .thenReturn(new FakeExecutableMongoModel(modelData));
            // create a service with the stub model
            let downloadService = new DownloadService(downloadModelSpy);
            // run the test
            return downloadService.getByTimeOfDay()
                .then(data => chai.assert.deepEqual(data, expectedData));
        });
    });
});