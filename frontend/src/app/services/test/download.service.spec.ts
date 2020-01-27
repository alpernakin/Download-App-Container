import { TestBed } from '@angular/core/testing';

import { DownloadService } from '../download.service';
import { SocketService } from '../socket.service';
import { RequestService } from '../request.service';
import { of } from 'rxjs';
import { DownloadResultItem, KeyValuePair } from 'src/app/models/response.models';
import { MapBox } from 'src/app/models/common';

var requestSpy = jasmine.createSpyObj('RequestService', ["get"]);
var socketSpy = jasmine.createSpyObj('SocketService', ['streamData']);

describe('DownloadService', () => {

    beforeEach(() => {
        // stub the socket
        socketSpy.streamData.and.callFake(() => of([]));

        TestBed.configureTestingModule({
            imports: [],
            providers: [
                { provide: RequestService, useValue: requestSpy },
                { provide: SocketService, useValue: socketSpy }
            ]
        });
    });

    it('should be created', () => {
        const service: DownloadService = TestBed.get(DownloadService);
        // run the test
        expect(service).toBeTruthy();
    });

    it('should run the data streamer', () => {
        const service: DownloadService = TestBed.get(DownloadService);
        expect(socketSpy.streamData).toHaveBeenCalled();
    })

    describe('getDownloadsInBounds', () => {

        var service: DownloadService;
        var dummyResultItem: DownloadResultItem;
        var dataFromServer: DownloadResultItem[];
        var expectedData: DownloadResultItem[];
        var mapBox: MapBox;
        var startDate: number;
        var endDate: number;

        beforeEach(() => {
            dummyResultItem = <DownloadResultItem>{
                app_id: "app_id",
                downloaded_at: "2018-12-02T11:47:51.115+00:00",
                latitude: 3.5,
                longitude: 2.5
            };
            // stub the request service response
            requestSpy.get.and.callFake(() => of(dataFromServer));
            // create the service
            service = TestBed.get(DownloadService);
            // simulate data from the server
            dataFromServer = [dummyResultItem];
            // expected data from the method
            expectedData = dataFromServer.map(data => {
                return { ...data, download_date: new Date(data.downloaded_at) }
            });
            // create dummy parameters
            mapBox = <MapBox>{
                southWest: { longitude: 5, latitude: 2 },
                northEast: { longitude: 8, latitude: 5 }
            }
        });

        it('should return mapped downloads in bounds and dates', () => {
            startDate = 1485365532000;
            endDate = 1579973532000;
            // run the test
            service.getDownloadsInBounds(mapBox, startDate, endDate).subscribe(data => {
                expect(requestSpy.get).toHaveBeenCalled();
                expect(data).toEqual(expectedData);
            });
        });

        it('should return mapped downloads in bounds without dates', () => {
            startDate = null;
            endDate = null;
            // run the test
            service.getDownloadsInBounds(mapBox, startDate, endDate).subscribe(data => {
                expect(requestSpy.get).toHaveBeenCalled();
                expect(data).toEqual(expectedData);
            });
        });
    });

    describe('getDownloadsMonthly', () => {
        var service: DownloadService;
        var dummyDataFromServer: KeyValuePair[];

        beforeEach(() => {
            dummyDataFromServer = [<KeyValuePair>{ key: 0, value: 12 }];
            // stub the request service response
            requestSpy.get.and.callFake(() => of(dummyDataFromServer));
            // create the service
            service = TestBed.get(DownloadService);
        });

        it('should return monthly downloads', () => {
            // run the test
            service.getMonthlyDownloads(2019).subscribe(data => {
                expect(requestSpy.get).toHaveBeenCalled();
                expect(data).toEqual(dummyDataFromServer);
            });
        });
    });

    describe('getDownloadsByCountry', () => {
        var service: DownloadService;
        var dummyDataFromServer: KeyValuePair[];

        beforeEach(() => {
            dummyDataFromServer = [<KeyValuePair>{ key: "Japan", value: 12 }, <KeyValuePair>{ key: "Germany", value: 11 }];
            // stub the request service response
            requestSpy.get.and.callFake(() => of(dummyDataFromServer));
            // create the service
            service = TestBed.get(DownloadService);
        });

        it('should return downloads by country', () => {
            // run the test
            service.getDownloadsByCountry().subscribe(data => {
                expect(requestSpy.get).toHaveBeenCalled();
                expect(data).toEqual(dummyDataFromServer);
            });
        });
    });

    describe('getDownloadsByTimeOfDay', () => {
        var service: DownloadService;
        var dummyDataFromServer: KeyValuePair[];

        beforeEach(() => {
            dummyDataFromServer = [<KeyValuePair>{ key: "Morning", value: 12 }, <KeyValuePair>{ key: "Evening", value: 5 }];
            // stub the request service response
            requestSpy.get.and.callFake(() => of(dummyDataFromServer));
            // create the service
            service = TestBed.get(DownloadService);
        });

        it('should return downloads by time of day', () => {
            // run the test
            service.getDownloadsByTimeOfDay().subscribe(data => {
                expect(requestSpy.get).toHaveBeenCalled();
                expect(data).toEqual(dummyDataFromServer);
            });
        });
    });
});