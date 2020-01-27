import { polygon, booleanContains, lineString } from '@turf/turf';
import { Point, MapBox } from './common';

export class MapBound implements MapBox {

    northWest: LatLong;
    northEast: LatLong;
    southEast: LatLong;
    southWest: LatLong;

    constructor(nWest: LatLong, nEast: LatLong, sEast: LatLong, sWest: LatLong) {
        this.northWest = nWest;
        this.northEast = nEast;
        this.southEast = sEast;
        this.southWest = sWest;
    }

    public getCoordinates(): Array<Array<number>> {
        return [
            [this.northWest.longitude, this.northWest.latitude],
            [this.northEast.longitude, this.northEast.latitude],
            [this.southEast.longitude, this.southEast.latitude],
            [this.southWest.longitude, this.southWest.latitude]
        ];
    }

    public getCircularCoordinates(): Array<Array<number>> {
        let coordinates = this.getCoordinates();
        coordinates.push(coordinates[0]);
        return coordinates;
    }

    /** returns if the coordinates are completely in the given object bounds */
    public isInBoundsOf(compareBounds: MapBound): boolean {
        let objectPolygon = polygon([compareBounds.getCircularCoordinates()]);
        let currentLineString = lineString(this.getCoordinates());
        // if the given object bounds is in the current bounds
        return booleanContains(objectPolygon, currentLineString);
    }
}

export class LatLong implements Point {

    constructor(lat: number, long: number) {
        this.latitude = lat;
        this.longitude = long;
    }

    latitude: number;
    longitude: number;
}