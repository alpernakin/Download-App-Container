import { validate, validationRules } from './validator.js';
import RateLimit from 'express-rate-limit';
import downloadRoute from './routes/download.route.js';

/**  handle action events */
export const middleware = function (req, res, next) {
    // action after response
    var afterResponse = function () {
        // TODO use logger
        console.log("Response has been sent.");
    };
    // hooks to execute after response
    res.on('finish', afterResponse);
    res.on('close', afterResponse);
    // do more
    next();
};

/** handle the errors throughout the application */
export const errorHandler = function (err, req, res, next) {
    console.log(err);
    // TODO use logger to log the error!
    res.status(err.status || 500);
    res.json(err.message);
};

/** api throttling, limit the number of requestst from the same origin */
const limiters = {
    getInBounds: RateLimit({ windowMs: 1000 * 60, max: 20 }),
    statistics: RateLimit({ windowMs: 1000 * 60, max: 10 })
}

/** map the routes through the express router and the controllers */
export const mapRoutes = function (router) {

    // conventional parameter order for routing: <route_string>, <request_limiter>, <validation_rules>, <validator_callback>, <action>

    router.get("/api/download/getInBounds", limiters.getInBounds, validationRules.getDownloadsInBounds, validate, downloadRoute.getInBounds);
    router.get("/api/download/getMonthly", limiters.statistics, validationRules.getMonthlyDownloads, validate, downloadRoute.getMonthly);
    router.get("/api/download/getByCountry", limiters.statistics, downloadRoute.getByCountry);
    router.get("/api/download/getByTimeOfDay", limiters.statistics, downloadRoute.getByTimeOfDay);

    return router;
};