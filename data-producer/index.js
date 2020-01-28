// here run the connection with mongodb
import './mongodb/connection.js';
import { DownloadService } from './services/download.service.js';
import downloadModel from './mongodb/download.schema.js';
import uuid from 'uuid';
import countries from './assets/countries.js';
import { setInterval, clearInterval } from 'timers';
import config from './app.config.js';
import timezones from './assets/timezones.js';

var service = new DownloadService(downloadModel);
var timezoneNames = Object.keys(timezones);
var countryCodes = Object.keys(countries);

class AutoDataProducer {

    constructor(options) {
        this.options = options;

        this.round = 0;
        this.timer = null;
        this.callback = null;

        this.execute = this.execute.bind(this);
        this.insertSingle = this.insertSingle.bind(this);
        this.insertBatch = this.insertBatch.bind(this);
        this.defaultInsertionCallback = this.defaultInsertionCallback.bind(this);
    }

    execute() {
        console.log("Auto Insertion is starting...");

        if (this.options.isBatchProcess) {
            console.log(`Batch insertion process preferred.`);
            console.log(`The batch capacity: ${this.options.batchCapacity}`);
            this.callback = this.insertBatch;
        }
        else {
            console.log(`Single insertion process preferred.`);
            this.callback = this.insertSingle;
        }

        console.log(`Interval: ${this.options.interval}`);
        console.log(`The process will be terminated after ${this.options.round} rounds`);

        this.timer = setInterval(() => this.callback(), this.options.interval);
    }

    defaultInsertionCallback() {
        this.round++;
        if (this.round >= this.options.round) {
            console.log("The timer has stopped!");
            clearInterval(this.timer);
        }
    }

    insertSingle() {
        var data = AutoDataProducer.createRandomData();
        service.insert(data).then(
            _ => {
                console.log(`[Single Item Insertion] the coordinates: ${data.location.coordinates}`);
                this.defaultInsertionCallback();
            },
            errReason => console.log(errReason));
    }

    insertBatch() {
        let items = [];
        for (let index = 0; index < this.options.batchCapacity; index++)
            items.push(AutoDataProducer.createRandomData());

        service.insert(items).then(
            _ => {
                console.log(`[Batch Item Insertion] the amount of entries: ${items.length}`);
                this.defaultInsertionCallback();
            },
            errReason => console.log(errReason));
    }

    /** 
     * tries to reflect the given object
     * complete the undefined or null fields with random data
     */
    static createRandomData(data = null) {

        if (!data) data = {};

        if (!data.location) {
            /** random latitude and longitude values */
            let lat = (Math.random() * 180) - 90;
            let long = (Math.random() * 360) - 180;

            data.location = { type: 'Point', coordinates: [long, lat] };
        }

        if (!data.app_id) {
            /** random guid app id */
            data.app_id = uuid.v1();
        }

        if (!data.downloaded_at) {
            /** random timestamp in seconds between 01/01/2018 - 28/01/2020 */
            let timestamp = (Math.random() * 65445518) + 1514764800;
            // to timestamp in ms and create a date
            data.downloaded_at = new Date(timestamp * 1000);
        }

        if (!data.country_code) {
            /** pick a random index from country codes */
            let randomIndex = Math.round(Math.random() * (countryCodes.length - 1));
            data.country_code = countryCodes[randomIndex];
        }

        if (!data.local_timezone) {
            /** pick a random index from country codes */
            let randomIndex = Math.round(Math.random() * (timezoneNames.length - 1));
            data.local_timezone = timezoneNames[randomIndex];
        }

        return data;
    }
}

/////////////////////////
// MAIN IMPLEMENTATION //
/////////////////////////

if (config.app.isAuto) {
    (new AutoDataProducer(config.app.auto)).execute();
}
else {
    var data = AutoDataProducer.createRandomData(config.app.manual.data);

    service.insert(data).then(
        _ => {
            console.log(`[Successful Manual Insertion]`);
            console.log(`---- The Object ----`);
            console.log(data);
            console.log(`--------------------`);
        },
        errReason => console.log(errReason));
}