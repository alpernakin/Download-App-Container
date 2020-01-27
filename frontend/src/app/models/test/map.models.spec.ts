import { } from '@angular/core/testing';
import { LatLong, MapBound } from '../map.models';

describe('Map Models', () => {

    describe('MapBound', () => {

        let largerBounds: MapBound;
        let smallerBounds: MapBound;
        let expectedCoordinates: Array<Array<number>>;

        beforeEach(() => {
            let northWest = new LatLong(5, 5);
            let northEast = new LatLong(5, 8);
            let southEast = new LatLong(2, 8);
            let southWest = new LatLong(2, 5);

            largerBounds = new MapBound(new LatLong(5, 5), new LatLong(5, 8), new LatLong(2, 8), new LatLong(2, 5));
            smallerBounds = new MapBound(new LatLong(4, 6), new LatLong(4, 7), new LatLong(3, 7), new LatLong(3, 6));

            expectedCoordinates = [
                [northWest.longitude, northWest.latitude],
                [northEast.longitude, northEast.latitude],
                [southEast.longitude, southEast.latitude],
                [southWest.longitude, southWest.latitude]
            ];
        });

        it('should return proper coordinates', () => {
            let coordinates = largerBounds.getCoordinates();
            expect(coordinates).toEqual(expectedCoordinates);
        });

        it('should convert to circular polygon coordinates', () => {
            expectedCoordinates.push(expectedCoordinates[0]);
            expect(largerBounds.getCircularCoordinates()).toEqual(expectedCoordinates);
        });

        it('should compare bounds', () => {
            expect(smallerBounds.isInBoundsOf(largerBounds)).toBeTruthy();
        });
    });
});