import { TestBed } from '@angular/core/testing';

import { SocketService } from '../socket.service';

var socketClientSpy = jasmine.createSpyObj('SocketClient', ["connect"])

describe('SocketService', () => {

	let service: SocketService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.get(SocketService);
		service.socketClient = socketClientSpy;
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
    });
    
	// todo add more tests for socket service
});