export const requestConfig = {
    responseType: "json",
    host: "localhost",
    port: 7779
};

export const socketConfig = {
    host: "localhost",
    port: 7779
};

export const blockUIConfig = {
    defaultText: "Loading..."
};

export const mapConfig = {
    baseURL: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    /** initial values on map start */
    initial: {
        center: [14.4378, 50.0755],
        zoom: 6
    },
    maxZoom: 18,
    minZoom: 4
};