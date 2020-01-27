export class DownloadResultItem {
    constructor(item) {
        this.longitude = item.location.coordinates[0];
        this.latitude = item.location.coordinates[1];
        this.app_id = item.app_id;
        /** ISO String representation of date */
        this.downloaded_at = item.downloaded_at;
    }
}

/**
 * Used for transferring statistics objects
 * Possible use: Monthly, By Country, By Time statistics
 */
export class KeyValuePair {

    /**
     * @param {*} key any type key
     * @param {*} value any type value
     */
    constructor(key, value) {
        this.key = key;
        this.value = value;
    }
}