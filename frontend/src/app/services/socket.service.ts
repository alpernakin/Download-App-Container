import { Injectable, OnDestroy } from '@angular/core';
import { Observable, of, interval, Subscription } from 'rxjs';
import * as io from 'socket.io-client';
import { socketConfig } from 'src/config';

@Injectable({
    providedIn: 'root'
})
export class SocketService implements OnDestroy {

    /** 
     * the socket client object
     */
    public socketClient: SocketIOClient.Socket;

    constructor() { }

    ngOnDestroy() {
        // disconnect the socket on destroy
        this.disconnect();
    }

    /** 
     * connect for the live data 
     * if the socket is already connected, then do nothing
     */
    public connectIfDisconnected() {
        if (this.isConnected()) return;

        this.connect();
    }

    private connect() {
        // socket connection info (can be different from the API server)
        let socketConnection = `http://${socketConfig.host}:${socketConfig.port}`;
        // connect to the IO port and get the real-time download data
        this.socketClient = io(socketConnection);
    }

    /**
     * disconnect the socket if it is already connected
     * otherwise do nothing
     */
    public disconnect() {
        if (this.isConnected())
            this.socketClient.disconnect();
    }

    public isConnected(): boolean {
        return this.socketClient && this.socketClient.connected;
    }

    /**
     * streams batch data from the server on a registered event id
     * the reason for release batch data internally on the UI application is to avoid lagging the system in case of receiving huge amount of data at once
     * if the socket is disconnected, it tries to connect back
     * @param eventId the event listen on the server socket
     * @param options.batchInterval the duration to collect data
     */
    public streamData<T>(eventId: string, options: { batchInterval: number } = { batchInterval: 1000 }): Observable<T[]> {
        // if the socket is not connected, then establish the connection
        this.connectIfDisconnected();

        return this.createBatchStream<T>(this.socketClient, eventId, options.batchInterval);
    }

    private createBatchStream<T>(socketClient: SocketIOClient.Socket, eventId: string, batchInterval: number): Observable<T[]> {
        return new Observable(observer => {
            let error = (errorMessage: string) => {
                observer.error(errorMessage);
            }
            // batch data chunk to collect
            let batchData: T[] = [];
            // create a timer observable
            let createInterval = (_interval): Subscription => interval(_interval).subscribe(_ => {
                // the timer emits the data chunk on a regular basis
                observer.next(batchData);
                batchData = [];
            });
            // if the socket is not there
            if (!socketClient) error("Socket client is not available");
            // start the batch timer
            let batchIntervalSubscription = createInterval(batchInterval);
            // for each entry, collect in the batch
            socketClient.on(eventId, (data: T) => batchData.push(data));
            // on connection error with the socket, clear the reference
            socketClient.on('connect_error', () => {
                // stop the timer
                if (batchIntervalSubscription)
                    batchIntervalSubscription.unsubscribe();
            });
            // on connect, start the batch timer again
            socketClient.on('connect', () => {
                // if it is not created yet or unsubscribed, then create again
                if (!batchIntervalSubscription || batchIntervalSubscription.closed)
                    batchIntervalSubscription = createInterval(batchInterval);
            });
        });
    }
}
