import { TestBed } from '@angular/core/testing';

import { SocketService } from '../socket.service';

/** Socket Client class for testing purposes */
class FakeSocketClient {

	public connected: boolean = false;
	/** register event id and callbacks map */
	private _eventRegister: { [key: string]: (args: any) => void }

	constructor() {
		this._eventRegister = {};
	}

	// MIMIC METHODS

	public connect() {
		this.connected = true;
		this.emitEvent("connect");
	}

	public disconnect() {
		this.connected = false;
		this.emitEvent("disconnect");
	}

	public on(event: string, callback: (args: any) => void) {
		this._eventRegister[event] = callback;
	}

	// FAKE METHODS

	private emitEvent(event: string, args: any = null) {
		// if the event callback is registered
		if (this._eventRegister[event] !== undefined && this._eventRegister[event] !== null) {
			// execute the callback
			this._eventRegister[event](args);
		}
	}

	public simulateConnectionError() {
		this.emitEvent("connect_error");
	}
}

describe('SocketService', () => {

	let service: SocketService;
	let fakeSocketClientCall = "getFakeSocketClient";

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.get(SocketService);
		// inject in any type fake model
		service.connect = () => {
			service.socketClient = <any>(new FakeSocketClient());
		};
		// fake method
		service[fakeSocketClientCall] = () => {
			return <any>service.socketClient;
		}
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should create a batch timer on an event', (done: DoneFn) => {

		let event = 'stream_random_numbers';

		let subscription = service.streamData<number>(event, { batchIntervalMs: 1000 }).subscribe(data => {
			expect(data).toEqual([1, 2, 3]);
			// stop the timer
			subscription.unsubscribe();
			// end the async test
			done();
		});
		// emit some dummy data over the event
		let fakeSocketClient = service[fakeSocketClientCall]();
		// assuming these operations would be done under batch interval duration
		fakeSocketClient.emitEvent(event, 1);
		fakeSocketClient.emitEvent(event, 2);
		fakeSocketClient.emitEvent(event, 3);
	});

	it('should re-start the batch timer on socket re-connection', (done: DoneFn) => {

		let event = 'stream_random_numbers';

		let subscription = service.streamData<number>(event, { batchIntervalMs: 1000 }).subscribe(data => {
			expect(data).toEqual([1]);
			// stop the timer
			subscription.unsubscribe();
			// end the async test
			done();
		});
		// emit some dummy data over the event
		let fakeSocketClient = service[fakeSocketClientCall]();
		// assuming these operations would be done under batch interval duration
		fakeSocketClient.emitEvent(event, 1);
		fakeSocketClient.simulateConnectionError();
		fakeSocketClient.connect();
	});

	// todo add more tests for socket service
});