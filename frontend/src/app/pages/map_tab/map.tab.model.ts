import { MapBound } from 'src/app/models/map.models';

export class PageParameters {

    /** map box coordinates */
    bounds: MapBound;
    /** optional unix timestamps */
    startDate?: number;
    endDate?: number;

    constructor(bounds: MapBound, startDate?: number, endDate?: number) {
        this.bounds = bounds;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    /** returns if the dates completely match */
    public equalDates(compare: PageParameters): boolean {
        return this.startDate === compare.startDate && this.endDate === compare.endDate;
    }
}