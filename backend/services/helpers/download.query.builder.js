export default class DownloadQueryBuilder {

    /**
     * query result expectation: an array of { download schema }
     * @param {*} bottomLeftCoords [long, lat]
     * @param {*} topRightCoords [long, lat]
     * @param {*} startDate JS Date object
     * @param {*} endDate JS Date object
     */
    static createInBoundsQuery(bottomLeftCoords, topRightCoords, startDate, endDate) {
        // form a box geometry to search download points in it
        let boxGeometry = [bottomLeftCoords, topRightCoords];
        // build the query
        let withinQuery = { location: { $geoWithin: { $box: boxGeometry } } };
        let dateQuery = { downloaded_at: { $gte: startDate, $lte: endDate } };

        return { ...withinQuery, ...dateQuery };
    }

    /**
     * query result expectation: an array of { _id: month-index, total: number }
     * @param {*} year number year
     */
    static createMonthlyAggregateQuery(year) {

        return [
            // distinguish the local year and month by using date time and timezone fields
            {
                $project: {
                    year: { $year: { date: "$downloaded_at", timezone: "$local_timezone" } },
                    month: { $month: { date: "$downloaded_at", timezone: "$local_timezone" } },
                }
            },
            // search by year
            {
                $match: { year: year }
            },
            // group by month
            {
                $group: {
                    _id: "$month",
                    total: { $sum: 1 }
                }
            }
        ];
    }

    /**
     * query result expectation: an array of { _id: country_code, total: number }
     * todo can be done generic
     */
    static createByCountryAggregateQuery() {
        return [
            { $group: { _id: "$country_code", total: { $sum: 1 } } }
        ];
    }

    /**
     * query result expectation: an array of { _id: hour-index, total: number }
     * @param {*} boundaries time of day boundaries in numeric hours [0, 12, 16, 19, 24]
     */
    static createByTimeAggregateQuery(boundaries) {
        return [
            // distinguish the local hour by using date time and timezone fields
            {
                $project: {
                    h: { $hour: { date: "$downloaded_at", timezone: "$local_timezone" } },
                }
            },
            // group the total counts by hour
            {
                $group: {
                    _id: "$h",
                    total: { $sum: 1 }
                }
            },
            // group the result by hour intervals
            // 0 - 12: Morning
            // 12 - 16: Afternoon
            // 16 - 19: Evening
            // 19 - 24: Night
            {
                $bucket: {
                    groupBy: "$_id",
                    boundaries: boundaries,
                    default: "Other",
                    output: {
                        total: { $sum: "$total" }
                    }
                }
            }
        ];
    }

    
}