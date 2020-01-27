import { serviceInstance } from '../services/download.service.js';

const okResponse = (data, statusCode = 200) => ({ data, statusCode });

const errorResponse = (message, statusCode = 500) => ({ data: message, statusCode });

export class DownloadController {

    constructor(service) {
        this.service = service;

        this.getInBounds = this.getInBounds.bind(this);
        this.getMonthly = this.getMonthly.bind(this);
        this.getByCountry = this.getByCountry.bind(this);
        this.getByTimeOfDay = this.getByTimeOfDay.bind(this);
    }

    getInBounds(params) {
        return this.service.getInBounds(params)
            .then(result => okResponse(result))
            .catch(error => errorResponse(error));
    }

    getMonthly(params) {
        return this.service.getMonthly(params)
            .then(result => okResponse(result))
            .catch(error => errorResponse(error));
    }

    getByCountry() {
        return this.service.getByCountry()
            .then(result => okResponse(result))
            .catch(error => errorResponse(error));
    }

    getByTimeOfDay() {
        return this.service.getByTimeOfDay()
            .then(result => okResponse(result))
            .catch(error => errorResponse(error));
    }
}
export const controllerInstance = new DownloadController(serviceInstance);