import { Injectable } from '@angular/core';
import { requestConfig, blockUIConfig } from 'src/config';
import { LoadingController, AlertController } from '@ionic/angular';
import { Observable, throwError, of, Subject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class RequestService {

    /** basic url info for API connection */
    private baseUrl: string;

    public serverError$ = new Subject<ServerError>();

    constructor(
        private http: HttpClient,
        private loading: LoadingController,
        private alert: AlertController) {

        this.baseUrl = `http://${requestConfig.host}:${requestConfig.port}`;
    }

    /** combine the base url and the endpoint */
    private combineURL(endpoint: string): string { return `${this.baseUrl}/${endpoint}` }

    /** 
     * get very basic headers object 
     */
    private getBasicHeaders(...additionalHeaders: { name: string, value: string }[]): HttpHeaders {
        let headers = new HttpHeaders({ "Access-Control-Allow-Origin": "*" });
        if (additionalHeaders && additionalHeaders.length)
            additionalHeaders.forEach(header => headers.append(header.name, header.value));
        return headers;
    }

    public get<T>(endpoint: string, params?: { [key: string]: any }, blockUI: BlockUI = null): Observable<T> {
        return this.processRequest(this.http.get<T>(this.combineURL(endpoint), { headers: this.getBasicHeaders(), params: params }), blockUI);
    }

    public post<T>(endpoint: string, body: any, blockUI: BlockUI = null): Observable<T> {
        let headers = this.getBasicHeaders({ name: "Content-Type", value: "application/json" });
        return this.processRequest(this.http.post<T>(this.combineURL(endpoint), body, { headers: headers }), blockUI);
    }

    /** common response pipe after all kinds of requests */
    public processRequest<T>(request: Observable<any>, blockUI: BlockUI = null): Observable<T> {
        // unique ID through timestamp in milliseconds
        let loaderId = new Date().getTime().toString();
        // if the request needs to block the UI, max duration 5 seconds
        if (blockUI)
            this.loading.create({ id: loaderId, message: blockUI.text, spinner: "dots", duration: 5000 })
                .then(loader => loader.present());

        return request.pipe(
            map(response => {
                if (blockUI)
                    this.loading.dismiss(loaderId).catch(_ => { });

                return response;
            }),
            catchError(err => {
                if (blockUI)
                    this.loading.dismiss(loaderId).catch(_ => { });

                let errorMessage = "";
                switch (err.status) {
                    case ServerError.ConnectionError: errorMessage = "Connection Error!"; break;
                    default: errorMessage = "Unexpected Error!";
                }

                this.alert.create({ message: errorMessage }).then(_alert => _alert.present());

                return this.handleError(err);
            })
        );
    }

    /** server error handler callback */
    public handleError(err: any) {
        // emit the error throughtout the application
        this.serverError$.next(err.status);
        // return the observable error
        return throwError(err);
    }
}

/** UI loader identifier class */
export class BlockUI {
    text?: string;
    constructor(text: string = null) {
        this.text = !!text ? text : blockUIConfig.defaultText
    }
}

/** 
 * possible server errors expected
 */
export enum ServerError {
    ConnectionError = 0,
    BadRequest = 400,
    SessionExpired = 401,
    InternalServerError = 500,
}