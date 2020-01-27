import { Injectable, OnDestroy } from '@angular/core';
import { Observable, of } from 'rxjs';
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
     * streams data chunks from the server on a registered event id
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
            if (!socketClient) {
                observer.error(new Error("Socket client is not available"));
                observer.complete();
            }
            // batch data chunk to collect
            let batchData: T[] = [];
            // for each entry, it saves in the chunk, which will be emitted
            socketClient.on(eventId, (data: T) => batchData.push(data));
            // the timer emits the data chunk on a regular basis
            let timer = setInterval(() => {
                // emit and empty the chunk
                observer.next(batchData);
                batchData = [];
            }, batchInterval);
            // on connection error kill the timer
            socketClient.on('connect_error', () => {
                if (!this.isConnected() && timer) {
                    observer.error('stream socket disconnected!');
                    observer.complete();
                    clearInterval(timer);
                    timer = null;
                }
            });
        });
    }
}
