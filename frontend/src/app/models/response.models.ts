export class DownloadResultItem {
    latitude: number;
    longitude: number;
    app_id: string;

    /** 
     * string representation of the date 
     * which directly comes from the API service
     */
    downloaded_at: string;

    // UI Specific Properties

    download_date: Date;
}

export class KeyValuePair {
    key: any;
    value: any;
}