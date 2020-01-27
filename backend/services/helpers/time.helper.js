export default class TimeHelper {

    /**
     * 
     * @param {*} identifier string identifier pointing out the lower bound local hour index 12:00 => 11
     */
    static getTimeOfDay(identifier) {
        // map the time of day
        let timeOfDay = {
            "0": "Morning 00:00 - 12:00",
            "12": "Afternoon 12:00 - 16:00",
            "16": "Evening 16:00 - 19:00",
            "19": "Night 19:00 - 24:00"
        }

        return timeOfDay[identifier];
    }
}