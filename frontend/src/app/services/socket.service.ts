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
        this.stopConnection();
    }

    public connect(connectionString: string) {
        // connect to the IO port and get real-time data
        this.socketClient = io(connectionString);
    }

    /** 
     * connect for the live data 
     * if the socket is already connected, then do nothing
     */
    public connectIfDisconnected() {
        if (this.isConnected()) return;

        this.startConnection();
    }

    public startConnection() {
        // socket connection info (can be different from the API server)
        let socketConnectionString = `http://${socketConfig.host}:${socketConfig.port}`;

        this.connect(socketConnectionString);
    }

    /**
     * disconnect the socket if it is already connected
     * otherwise do nothing
     */
    public stopConnection() {
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
     * @param options.batchIntervalMs the duration to collect data in milliseconds
     */
    public streamData<T>(eventId: string, options: { batchIntervalMs: number } = { batchIntervalMs: 1000 }): Observable<T[]> {
        // if the socket is not connected, then establish the connection
        this.connectIfDisconnected();

        return this.createBatchStream<T>(this.socketClient, eventId, options.batchIntervalMs);
    }

    private createBatchStream<T>(socketClient: SocketIOClient.Socket, eventId: string, batchInterval: number): Observable<T[]> {
        return new Observable(observer => {
            let error = (errorMessage: string) => {
                observer.error(errorMessage);
            }
            // batch data to collect
            let batchData: T[] = [];
            // create a timer observable
            let createTimerSubscription = (_interval): Subscription => interval(_interval).subscribe(_ => {
                // if we have something in the batch data collection
                if (batchData && batchData.length) {
                    // the timer emits the data chunk on a regular basis
                    observer.next(batchData);
                    batchData = [];
                }
            });
            // if the socket is not there
            if (!socketClient) error("Socket client is not available");
            // start the batch timer
            let batchTimerSubscription = createTimerSubscription(batchInterval);
            // callback to end the timer
            let stopTimerSubscription = () => {
                if (batchTimerSubscription)
                    batchTimerSubscription.unsubscribe();
            }
            // for each entry, collect in the batch
            socketClient.on(eventId, (data: T) => batchData.push(data));
            // on connection error with the socket, clear the reference
            socketClient.on('connect_error', () => {
                // stop the timer
                stopTimerSubscription();
            });
            // on connect, start the batch timer again
            socketClient.on('connect', () => {
                // if it is not created yet or unsubscribed, then create again
                if (!batchTimerSubscription || batchTimerSubscription.closed)
                    batchTimerSubscription = createTimerSubscription(batchInterval);
            });
            // if the current subscription ends/completes
            observer.add(_ => {
                // stop the timer
                stopTimerSubscription();
            });
        });
    }
}
