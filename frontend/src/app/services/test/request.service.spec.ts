import { TestBed } from '@angular/core/testing';
import { RequestService, BlockUI, ServerError } from '../request.service';
import { HttpClient } from '@angular/common/http';
import { LoadingController, AlertController } from '@ionic/angular';
import { Observable, of } from 'rxjs';

var httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
var loadingSpy = jasmine.createSpyObj('LoadingController', ['dismiss', 'create']);
var alertSpy = jasmine.createSpyObj('AlertController', ['create']);

/** to be used for simulating alert and loading async functions */
class FakeLoader {
    constructor() { }
    present() { }
}

describe('RequestService', () => {

    let service: RequestService;

    beforeEach(() => {

        TestBed.configureTestingModule({
            imports: [],
            providers: [
                { provide: HttpClient, useValue: httpClientSpy },
                { provide: LoadingController, useValue: loadingSpy },
                { provide: AlertController, useValue: alertSpy },
            ]
        });

        service = TestBed.get(RequestService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should make a request', async () => {
        // stub the http client method
        httpClientSpy.get.and.callFake(() => of(true));
        // run the test
        service.get<boolean>("dummy_endpoint", null, null).subscribe(_ => {
            expect(httpClientSpy.get).toHaveBeenCalled();
        });
    })

    it('should emit global server error', async () => {
        service.serverError$.subscribe(err => {
            expect(err).toBe(ServerError.InternalServerError);
        });
        service.handleError({ status: 500 });
    });

    it('should show and hide the block UI loader', async () => {
        // stub the loading controller methods
        loadingSpy.create.and.callFake(() => Promise.resolve(new FakeLoader()));
        loadingSpy.dismiss.and.callFake(() => Promise.resolve(true));
        // run the test
        service.processRequest(of("dummy"), new BlockUI()).subscribe(_ => {
            expect(loadingSpy.create).toHaveBeenCalled();
            expect(loadingSpy.dismiss).toHaveBeenCalled();
        });
    });

    it('should alert on server error', async () => {
        // stub the alert controller method
        alertSpy.create.and.callFake(() => Promise.resolve(new FakeLoader()));
        // simulate an error response
        let fakeErrorObservable = new Observable(observer => observer.error(new Error("dummy")))
        // run the test
        service.processRequest(fakeErrorObservable).subscribe(_ => {
            expect(alertSpy.create).toHaveBeenCalled();
        });
    });
});