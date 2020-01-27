import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Map, tileLayer, marker, MarkerClusterGroup, markerClusterGroup, Marker, LatLng } from 'leaflet';
import 'leaflet.markercluster';

/**
 * Map configuration model
 */
export type MapConfig = { baseURL: string, initial: { center: number[], zoom: number }, maxZoom: number, minZoom: number };

/**
 * @param zoom the current zoom level of the map
 * @param bounds map polygon bounds
 */
export type MapActionEvent = { bounds: MapBounds, zoom?: number };

/**
 * rectangle map box bounds
 * [longitude, latitude]
 */
export type MapBounds = { northWest: number[], northEast: number[], southEast: number[], southWest: number[] }

/**
 * map component that shows clustered markers
 * dependent on leaflet and markercluster libraries
 */
@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {

    private readonly mapIdentifier: string = "map";
    /** 
     * the map object reference 
     */
    public map: Map;

    /** 
     * a layer to cluster the markers over the current map 
     */
    public markerCluster: MarkerClusterGroup;

    /**
     * configuration to setup the map
     */
    @Input("config") config: any;

    /**
     * map sliding, zoom event or on init
     */
    @Output("onMapMoveAction") onMapMoveAction = new EventEmitter<MapActionEvent>();

    constructor() { }

    ngOnInit() { }

    /**
     * initialize the map and the cluster layer
     * manage the event binding
     */
    public async initialize() {

        if (!this.config)
            throw new Error("Map configuration is required.");
        if (!this.config.baseURL)
            throw new Error("Map base URL is required.");

        let center = new LatLng(this.config.initial.center[1], this.config.initial.center[0]);
        // init the local map object
        this.map = new Map(this.mapIdentifier).setView(center, this.config.initial.zoom);
        // fetch the map and bind to the map object
        tileLayer(this.config.baseURL, { maxZoom: this.config.maxZoom, minZoom: this.config.minZoom }).addTo(this.map);
        // now add the cluster layer over the map
        this.markerCluster = markerClusterGroup();
        this.map.addLayer(this.markerCluster);

        // define the callback for map actions
        var onMapMoveEventCallback = () => {
            if (this.map && this.markerCluster) {
                // form the event
                let event = <MapActionEvent>{
                    zoom: this.map.getZoom(),
                    bounds: this.getBounds()
                };
                // here emit the event to the parent
                this.onMapMoveAction.emit(event);
            }
        };

        // bind events
        // on zoom and sliding starts
        this.map.on('movestart', () => { });
        // on zoom and sliding ends
        this.map.on('moveend', () => onMapMoveEventCallback());
    }

    /**
     * returns the rectange bounds of the map
     */
    public getBounds(): MapBounds {
        let mapBounds = this.map.getBounds();
        let northWest = mapBounds.getNorthWest();
        let northEast = mapBounds.getNorthEast();
        let southEast = mapBounds.getSouthEast();
        let southWest = mapBounds.getSouthWest();

        return <MapBounds>{
            northWest: [northWest.lng, northWest.lat],
            northEast: [northEast.lng, northEast.lat],
            southEast: [southEast.lng, southEast.lat],
            southWest: [southWest.lng, southWest.lat]
        };
    }

    /**
     * clean all the layers from the map
     */
    public clearLayers() {
        this.markerCluster.clearLayers();
    }

    /**
     * creates a marker to add on the map
     */
    public createMarker(latitude: number, longitude: number, popupContent: string): Marker {
        return marker(new LatLng(latitude, longitude)).bindPopup(popupContent);
    }

    /**
     * add markers to the cluster
     * @param markers *
     */
    public addMarkers(...markers: Marker[]) {
        this.markerCluster.addLayers(markers);
    }
}
