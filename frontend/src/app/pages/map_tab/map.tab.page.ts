import { Component, EventEmitter, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { mapConfig } from '../../../config';
import { DownloadService } from 'src/app/services/download.service';
import { debounceTime, filter } from 'rxjs/operators';
import { MapBound, LatLong } from 'src/app/models/map.models';
import { DownloadResultItem } from 'src/app/models/response.models';
import { Subscription, Observable } from 'rxjs';
import { DestroySubscribers } from 'src/app/decorators/destroy.subscribers';
import { MapComponent, MapActionEvent, MapConfig } from 'src/app/components/map/map.component';
import { PageParameters } from './map.tab.model';

/**
 * @param pageParams page specific parameters for request
 * @param forceToRequest force to load new data
 */
type OnRequestEvent = { pageParams: PageParameters, forceToRequest: boolean }

/** max timestamp in milliseconds */
const MAX_TIMESTAMP = 8640000000000000;
/** min timestamp in milliseconds */
const MIN_TIMESTAMP = -8640000000000000;

@DestroySubscribers()
@Component({
    selector: 'app-map-tab',
    templateUrl: 'map.tab.page.html',
    styleUrls: ['map.tab.page.scss']
})
export class MapTabPage implements OnDestroy, OnInit {

    private subscribers: { [key: string]: Subscription } = {};

    /** 
     * page action debounce time
     * 1000 by default, as it is found the optimum time for preventing multiple queries
     */
    private actionDebounceTimeMs: number = 1000;

    /** 
     * configuration to setup the map 
     */
    public mapConfig: MapConfig;

    /** 
     * to be triggered on data demanding events
     */
    public onRequestEvent = new EventEmitter<OnRequestEvent>();

    /**
     * lastly queried parameters stored to compare for the next one
     */
    public lastQueriedParams: PageParameters;

    // set to the last week
    public startDateString = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString();
    // set to the current date
    public endDateString = new Date().toISOString();

    /** 
     * local request status 
     * if the component is currently waiting for response from a download in bounds request 
     */
    private _dataLoading: boolean = false;

    /**
     * the state if the map has already initialized
     */
    private _mapInitialized: boolean = false;

    /**
     * map component to manage geo operations
     */
    @ViewChild(MapComponent, { static: false }) mapComponent: MapComponent;

    constructor(
        private download: DownloadService) {

        this.createRequestEvent = this.createRequestEvent.bind(this);
        this.mapConfig = mapConfig;
    }

    ionViewDidEnter() {
        // a work around because of the problem with leaflet map
        // when the map initialized on ngOnInit or others, it fails the load the tiles
        // so it checks if the map already initialized each time page viewed, to prevent multiple inits
        if (!this._mapInitialized)
            this.mapComponent.initialize().then(_ => {
                this._mapInitialized = true;
                // create an inital request event on map initialization
                this.createRequestEvent();
            });
    }

    ngOnInit() {
        if (!this.subscribers) this.subscribers = {};

        // triggered on map actions, mouse move, zoom in out, map init
        // queue consecutively events, to prevent multiple conflicting events
        this.subscribers["pageAction"] = this.onRequestEvent.pipe(debounceTime(this.actionDebounceTimeMs)).subscribe(event => {
            // if new data needed!!!
            if (event.forceToRequest || this.checkIfPageNeedsData(this.lastQueriedParams, event.pageParams))
                this.loadData(event.pageParams.bounds, event.pageParams.startDate, event.pageParams.endDate)
                    .subscribe(_ => { }, err => { });
        });

        // connect to the real-time stream
        this.subscribers["downloadDataStreamer"] =
            this.download.downloadDataStreamer$.subscribe(data => {
                if (!data || !data.length) return;
                // if the map is already waiting for data
                // then ignore the new data arrived
                if (this._dataLoading) return;
                if (!this._mapInitialized) return;
                console.log(data);
                let filteredData = this.filterStreamData(...data);
                // then map them to markers
                let downloadMarkers = filteredData.map(item => this.createDownloadMarker(item));
                // finally show on the map
                this.mapComponent.addMarkers(...downloadMarkers);
            });
    }

    // must be implemented to destroy subscribers on destroy
    ngOnDestroy() { }

    public onMapMoveActionCallback(_event: MapActionEvent) {

        // directly emit the page action
        this.createRequestEvent();
    }

    public onDateChangedCallback(_event: any) {

        // call the request event
        this.createRequestEvent();
    }

    public onRefreshClicked(_event: MouseEvent) {

        // force to request again this time
        this.createRequestEvent({ forceToRequest: true });
    }

    /** 
     * @param {*} options.forceToRequest forces to request though no need to make a new request, false by default
     */
    private createRequestEvent(options: { forceToRequest: boolean } = { forceToRequest: false }) {

        // queue consecutively events
        this.onRequestEvent.emit({ pageParams: this.getCurrentParameters(), forceToRequest: options.forceToRequest });
    }

    /** returns the current map bounds and dates */
    public getCurrentParameters(): PageParameters {
        let bounds = this.getMapBounds();
        let startDate = this.startDateString ? new Date(this.startDateString).getTime() : null;
        let endDate = this.endDateString ? new Date(this.endDateString).getTime() : null;
        return new PageParameters(bounds, startDate, endDate);
    }

    /** returns the current map box bounds */
    public getMapBounds(): MapBound {
        let mapBox = this.mapComponent.getBounds();
        return new MapBound(
            new LatLong(mapBox.northWest[1], mapBox.northWest[0]),
            new LatLong(mapBox.northEast[1], mapBox.northEast[0]),
            new LatLong(mapBox.southEast[1], mapBox.southEast[0]),
            new LatLong(mapBox.southWest[1], mapBox.southWest[0])
        );
    }

    /**
     * creates a marker to add on the map with the given download data
     * returns any type as the component does not have to know about map component models
     * @param item download item
     */
    private createDownloadMarker(item: DownloadResultItem): any {
        let dateString = new Date(item.downloaded_at).toDateString();
        let popupContent = `App ID: <strong>${item.app_id}</strong><br>Downloaded At: <strong>${dateString}</strong>`;
        return this.mapComponent.createMarker(item.latitude, item.longitude, popupContent);
    }

    /**
     * check if the criteria has changed after the lastly queried data
     * this method prevents to re-fetch same data again and again
     * @param currentBounds the current map bounds
     */
    public checkIfPageNeedsData(lastQueriedParams: PageParameters, currentParams: PageParameters): boolean {
        if (!currentParams) return false;
        // check if the new map bounds is out of the lastly queried one
        if (!lastQueriedParams) return true;
        // check if the current dates match with the lastly queried date params
        let isInLastQueriedPeriod = currentParams.equalDates(lastQueriedParams);
        // if it is in different period, then immediately return
        if (!isInLastQueriedPeriod) return true;
        // else check the map bounds as well
        return !currentParams.bounds.isInBoundsOf(lastQueriedParams.bounds);
    }

    /** demands download data from the server */
    public loadData(bounds: MapBound, startDate: number, endDate: number): Observable<boolean> {
        return new Observable<boolean>(observer => {
            this._dataLoading = true;
            // request the data
            this.download.getDownloadsInBounds(bounds, startDate, endDate).subscribe(
                data => {
                    // set the the flag data loading false before blocking operations
                    // for not missing the stream data
                    this._dataLoading = false;
                    // delete the markers for the new ones
                    this.mapComponent.clearLayers();
                    // mark the on the map
                    this.mapComponent.addMarkers(...data.map(item => this.createDownloadMarker(item)))
                    // mark the queried bounds to compare with the next action
                    this.lastQueriedParams = new PageParameters(bounds, startDate, endDate);

                    observer.next(true);
                },
                error => {
                    this._dataLoading = false;
                    observer.error(error);
                }
            ).add(() => {
                observer.complete();
            });
        });
    }

    /** filters the incoming data from real-time streamer */
    public filterStreamData(...data: DownloadResultItem[]): DownloadResultItem[] {
        // if the dates are null, then pick min-max timestamps
        let startDate = this.startDateString ? new Date(this.startDateString) : new Date(MIN_TIMESTAMP);
        let endDate = this.endDateString ? new Date(this.endDateString) : new Date(MAX_TIMESTAMP);
        // return the items that can be positioned on the map
        return data.filter(item => item.download_date >= startDate && item.download_date <= endDate);
    }
}