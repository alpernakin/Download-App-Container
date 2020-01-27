import { validationResult, check } from 'express-validator';

export const validationRules = {

    getDownloadsInBounds: [
        check(['bl_lng', 'bl_lat', 'tr_lng', 'tr_lat'])
            .isNumeric().withMessage('Invalid location value!')
            .exists({ checkNull: true }).withMessage('Bound locations are required!'),

        // optional start date

        // optional end date
    ],

    getMonthlyDownloads: [
        check('year')
            .isNumeric().withMessage('Invalid year value!')
            .exists({ checkNull: true }).withMessage('Year value is required!'),
    ]
}

// todo add validator tests

/** default validator callback */
export const validate = (req, res, next) => {
    let errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    let extractedErrors = []
    errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }))

    return res.status(422).json({ errors: extractedErrors });
};