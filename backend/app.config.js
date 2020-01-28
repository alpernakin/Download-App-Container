const config = {
    app: {
        port: 7779
    },

    mongoDb: {
        // if the docker runs, please switch from 'localhost' to 'mongo'
        host: "localhost",
        port: 27017,
        database: "my_db"
    }
};
export default config;