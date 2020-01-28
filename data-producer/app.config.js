const config = {

    app: {
        /** 
         * if the insertion process is automatic with random data 
         * the alternative is manual insertion with the values below
         */
        isAuto: true,

        auto: {
            /** 
             * if it is a batch insert process 
             * the alternative is single insertion
             */
            isBatchProcess: true,
            /**
             * consider this if batch process is preferred 
             * the amount of data entry at one batch insertion
             */
            batchCapacity: 100,
            /** 
             * interval in ms 
             * if the option 'single' preferred, the app inserts single data in the given interval
             * if the option 'batch' preferred, the app inserts batch data in the given interval
             */
            interval: 1000,
            /** how many times insertion process runs with the given interval */
            round: 100,
        },

        /** 
         * if manual insertion preferred, the app read object values from here
         * and it tries to insert single item in the database
         */
        manual: {
            /** if the app cannot find the required fields, it will automatically assign random values */
            data: {
                // [<long>, <lat>]
                location: { type: 'Point', coordinates: [52.31233, 17.33214] },
                app_id: "random_app_id",
                country_code: "DE",
                downloaded_at: new Date('2020-01-20'),
                local_timezone: 'Europe/Berlin'
            }
        }
    },

    mongoDb: {
        host: "localhost",
        port: 27017,
        database: "my_db"
    }
}
export default config;