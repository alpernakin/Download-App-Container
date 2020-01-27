export class GetDownloadsInBoundsRequest {
    /** bottom left lat and long */
    bl_lng: number;
    bl_lat: number;
    /** top right lat and long */
    tr_lng: number;
    tr_lat: number;
    startDate?: number;
    endDate?: number;
}