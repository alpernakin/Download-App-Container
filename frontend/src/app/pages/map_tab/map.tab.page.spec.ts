import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MapTabPage } from './map.tab.page';
import { ComponentsModule } from 'src/app/components/components.module';
import { FormsModule } from '@angular/forms';
import { DownloadService } from 'src/app/services/download.service';
import { of } from 'rxjs';
import { DownloadResultItem } from 'src/app/models/response.models';
import { PageParameters } from './map.tab.model';
import { MapBound, LatLong } from 'src/app/models/map.models';

var downloadSpy = jasmine.createSpyObj('DownloadService', ["getDownloadsInBounds", "downloadDataStreamer$"]);
var mapComponentSpy = jasmine.createSpyObj('MapComponent', ["addMarkers", "clearLayers", "createMarker", "getBounds"]);

describe('MapTabPage', () => {
    let component: MapTabPage;
    let fixture: ComponentFixture<MapTabPage>;

    let dummyMapBorders: any;
    let dummyDownloadResultItem: DownloadResultItem;

    let createDummyMapBorders = () => {
        return {
            northWest: [5, 5],
            northEast: [8, 5],
            southEast: [8, 2],
            southWest: [5, 2]
        }
    };

    let createDummyDownloadResultItem = () => {
        return <DownloadResultItem>{
            app_id: "app_id",
            latitude: 2,
            longitude: 3,
            downloaded_at: "2018-12-02T11:47:51.115+00:00",
            download_date: new Date("2018-12-02T11:47:51.115+00:00")
        }
    };

    beforeEach(async(() => {
        dummyMapBorders = createDummyMapBorders();
        // stub download service
        downloadSpy.getDownloadsInBounds.and.callFake(() => of([createDummyDownloadResultItem()]));
        downloadSpy.downloadDataStreamer$ = of(dummyDownloadResultItem);

        TestBed.configureTestingModule({
            declarations: [MapTabPage],
            imports: [IonicModule.forRoot(), FormsModule, ComponentsModule],
            providers: [
                { provide: DownloadService, useValue: downloadSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(MapTabPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
        // inject spy map component
        mapComponentSpy.getBounds.and.callFake(() => createDummyMapBorders());
        component.mapComponent = mapComponentSpy;
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return proper map bounds', () => {
        expect(component.getMapBounds()).toEqual(
            new MapBound(new LatLong(5, 5), new LatLong(5, 8), new LatLong(2, 8), new LatLong(2, 5))
        );
    });

    it('should compare dates/periods', () => {
        let firstModel = new PageParameters(null, 1580047515361, null);
        let secondModel = new PageParameters(null, 1580047515361, null);
        expect(firstModel.equalDates(secondModel)).toBeTruthy();
    });

    it('should require new data on a larger map zoom', () => {
        let largerBounds = new MapBound(new LatLong(5, 5), new LatLong(5, 8), new LatLong(2, 8), new LatLong(2, 5));
        let smallerBounds = new MapBound(new LatLong(4, 6), new LatLong(4, 7), new LatLong(3, 7), new LatLong(3, 6));

        let lastQueriedParameters = new PageParameters(smallerBounds, null, null);
        let currentParameters = new PageParameters(largerBounds);

        expect(component.checkIfPageNeedsData(lastQueriedParameters, currentParameters)).toBeTruthy();
    });

    it('should require new data on a different map tile', () => {
        let largerBounds = new MapBound(new LatLong(5, 5), new LatLong(5, 8), new LatLong(2, 8), new LatLong(2, 5));
        let smallerBounds = new MapBound(new LatLong(10, 10), new LatLong(9, 12), new LatLong(8, 12), new LatLong(8, 11));

        let lastQueriedParameters = new PageParameters(smallerBounds, null, null);
        let currentParameters = new PageParameters(largerBounds);

        expect(component.checkIfPageNeedsData(lastQueriedParameters, currentParameters)).toBeTruthy();
    });

    it('should require new data with new date inputs', () => {
        let dummyBounds = new MapBound(new LatLong(5, 5), new LatLong(5, 8), new LatLong(2, 8), new LatLong(2, 5));

        let lastQueriedParameters = new PageParameters(dummyBounds, null, null);
        let currentParameters = new PageParameters(dummyBounds, 1580047515361, null);

        expect(component.checkIfPageNeedsData(lastQueriedParameters, currentParameters)).toBeTruthy();
    });

    it('should create request event when refresh clicked', async () => {
        component.onRequestEvent.subscribe(event => expect(event).toBeTruthy());
        component.onRefreshClicked(null);
    });

    it('should create request event when map move', async () => {
        component.onRequestEvent.subscribe(event => expect(event).toBeTruthy());
        component.onMapMoveActionCallback(null);
    });

    it('should create request event when date change', async () => {
        component.onRequestEvent.subscribe(event => expect(event).toBeTruthy());
        component.onDateChangedCallback(null);
    });

    it('should refresh the map items on data load', async () => {
        component.loadData(null, null, null).subscribe(_ => {
            expect(mapComponentSpy.clearLayers).toHaveBeenCalled();
            expect(mapComponentSpy.addMarkers).toHaveBeenCalled();
        });
    });

    it('should refresh last queried parameters on data load', async () => {
        let dummyBounds = new MapBound(new LatLong(5, 5), new LatLong(5, 8), new LatLong(2, 8), new LatLong(2, 5));
        let expectedData = new PageParameters(dummyBounds, null, null);
        component.loadData(dummyBounds, null, null).subscribe(_ => {
            expect(component.lastQueriedParams).toEqual(expectedData);
        });
    });

    it('should filter stream data, which can meet the requirements', () => {
        // create dummy data
        let dummyEarlyData = <DownloadResultItem>{
            latitude: 2,
            longitude: 3,
            download_date: new Date("2018-12-02T11:47:51.115+00:00")
        };
        let dummyMidData = <DownloadResultItem>{
            latitude: 2,
            longitude: 3,
            download_date: new Date("2019-06-02T11:47:51.115+00:00")
        };
        let dummyLateData = <DownloadResultItem>{
            latitude: 2,
            longitude: 3,
            download_date: new Date("2020-01-02T11:47:51.115+00:00")
        };
        // restrictions
        component.startDateString = "2019-02-01T11:47:51.115+00:00"
        component.endDateString = "2019-09-01T11:47:51.115+00:00";
        expect(component.filterStreamData(...[dummyEarlyData, dummyMidData, dummyLateData])).toEqual([dummyMidData]);
    });
});