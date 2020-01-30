import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MapComponent, MapConfig, MapBounds } from './map.component';
import { CommonModule } from '@angular/common';

describe('MapComponent', () => {
	let component: MapComponent;
	let fixture: ComponentFixture<MapComponent>;
	let defaultConfig: MapConfig;

	beforeEach(async(() => {

		defaultConfig = <MapConfig>{
			baseURL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
			initial: { center: [0, 0], zoom: 5 },
			maxZoom: 18,
			minZoom: 4
		};

		TestBed.configureTestingModule({
			declarations: [MapComponent],
			imports: [IonicModule.forRoot(), CommonModule]
		}).compileComponents();

		fixture = TestBed.createComponent(MapComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('initialize the map', (done: DoneFn) => {
		component.config = defaultConfig;
		component.initialize().then(_ => {
			expect(component.map).toBeTruthy();
			// end the async test
			done();
		});
	});

	it('should fail without config', (done: DoneFn) => {
		component.initialize().catch(err => {
			expect(err).toEqual(new Error("Map configuration is required."))
			// end the async test
			done();
		});
	});

	it('should fail without base url', (done: DoneFn) => {
		component.config = defaultConfig;
		component.config.baseURL = null;
		component.initialize().catch(err => {
			expect(err).toEqual(new Error("Map base URL is required."));
			// end the async test
			done();
		});
	});

	it('should get corresponding bounds', () => {
		let mapBoundsResponse = {
			getNorthWest() { return { lng: 0, lat: 1 } },
			getNorthEast() { return { lng: 0, lat: 1 } },
			getSouthEast() { return { lng: 0, lat: 1 } },
			getSouthWest() { return { lng: 0, lat: 1 } }
		};

		let expectedData = <MapBounds>{
			northWest: [mapBoundsResponse.getNorthWest().lng, mapBoundsResponse.getNorthWest().lat],
			northEast: [mapBoundsResponse.getNorthEast().lng, mapBoundsResponse.getNorthEast().lat],
			southEast: [mapBoundsResponse.getSouthEast().lng, mapBoundsResponse.getSouthEast().lat],
			southWest: [mapBoundsResponse.getSouthWest().lng, mapBoundsResponse.getSouthWest().lat]
		}

		// create a spy map object
		let mapSpy = jasmine.createSpyObj('map', ['getBounds']);
		mapSpy.getBounds.and.callFake(() => mapBoundsResponse);
		component.map = mapSpy;
		// run the test
		expect(component.getBounds()).toEqual(expectedData);
	});

	it('should call marker cluster', () => {
		// create a spy marker cluster
		let markerClusterSpy = jasmine.createSpyObj('markerCluster', ['addLayers', 'clearLayers']);
		component.markerCluster = markerClusterSpy;
		// run the method
		component.addMarkers();
		// run the test
		expect(markerClusterSpy.addLayers).toHaveBeenCalled();
		component.clearLayers();
		// run the test
		expect(markerClusterSpy.clearLayers).toHaveBeenCalled();
	});
});
