import { controllerInstance } from "../controllers/download.controller";

class DownloadRoute {

    constructor(controller) {
        this.controller = controller;

        this.getInBounds = this.getInBounds.bind(this);
        this.getMonthly = this.getMonthly.bind(this);
        this.getByCountry = this.getByCountry.bind(this);
        this.getByTimeOfDay = this.getByTimeOfDay.bind(this);

        this.responseCallback = (response, statusCode, data) => {
            response.status(statusCode);
            response.json(data);
        };
    }

    getInBounds(request, response) {
        this.controller.getInBounds(request.query)
            .then(result => this.responseCallback(response, result.statusCode, result.data));
    }

    getMonthly(request, response) {
        this.controller.getMonthly(request.query)
            .then(result => this.responseCallback(response, result.statusCode, result.data));
    }

    getByCountry(request, response) {
        this.controller.getByCountry()
            .then(result => this.responseCallback(response, result.statusCode, result.data));
    }

    getByTimeOfDay(request, response) {
        this.controller.getByTimeOfDay()
            .then(result => this.responseCallback(response, result.statusCode, result.data));
    }
}
export default new DownloadRoute(controllerInstance);

// todo add download route tests