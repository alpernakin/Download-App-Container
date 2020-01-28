import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { DownloadResultItem, KeyValuePair } from '../models/response.models';
import { RequestService, BlockUI } from './request.service';
import { GetDownloadsInBoundsRequest } from '../models/request.models';
import { MapBound } from '../models/map.models';
import { SocketService } from './socket.service';
import { map } from 'rxjs/operators';
import { MapBox } from '../models/common';

@Injectable({
    providedIn: 'root'
})
export class DownloadService {

    /** the stream data emitter/streamer */
    public downloadDataStreamer$ = new Subject<DownloadResultItem[]>();

    constructor(
        private request: RequestService,
        private socket: SocketService) {

        this.startStreaming();
    }

    /** starts streaming data on the given event id */
    private startStreaming() {
        // use the socket dependency to start
        this.socket.streamData<DownloadResultItem>("download_data_stream", { batchInterval: 1000 })
            // map the data from the socket
            .pipe<DownloadResultItem[]>(this._mapDownloadDataCallback())
            // emit the data in the application
            .subscribe(data => {
                console.log(data);
                this.downloadDataStreamer$.next(data)
            });
    }

    /** general mapping callback for download result item response */
    private _mapDownloadDataCallback() {
        return map<DownloadResultItem[], DownloadResultItem[]>(data => {
            // map the date objects
            data.forEach(x => x.download_date = new Date(x.downloaded_at));
            // return the array again
            return data;
        });
    }

    /** request data in map box and the given period */
    public getDownloadsInBounds(box: MapBox, startDate?: number, endDate?: number): Observable<DownloadResultItem[]> {
        let params = <GetDownloadsInBoundsRequest>{
            bl_lng: box.southWest.longitude,
            bl_lat: box.southWest.latitude,
            tr_lng: box.northEast.longitude,
            tr_lat: box.northEast.latitude,
            startDate: startDate ? startDate : '',
            endDate: endDate ? endDate : ''
        }

        return this.request.get("api/download/getInBounds", params, new BlockUI("Download points are loading..."))
            // map the data from API
            .pipe<DownloadResultItem[]>(this._mapDownloadDataCallback());
    }

    public getMonthlyDownloads(year: number): Observable<KeyValuePair[]> {
        return this.request.get("api/download/getMonthly", { year: year }, new BlockUI("Loading statistics..."));
    }

    public getDownloadsByCountry(): Observable<KeyValuePair[]> {
        return this.request.get("api/download/getByCountry", null, new BlockUI("Loading statistics..."));
    }

    public getDownloadsByTimeOfDay(): Observable<KeyValuePair[]> {
        return this.request.get("api/download/getByTimeOfDay", null, new BlockUI("Loading statistics..."));
    }
}
