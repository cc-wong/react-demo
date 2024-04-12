/**
 * Data type representing a tournament.
 */
export class Tournament {

    /**
     * Tournament code.
     */
    static Code = {
        HATSU: 'HATSU',
        HARU: 'HARU',
        NATSU: 'NATSU',
        NAGOYA: 'NAGOYA',
        AKI: 'AKI',
        KYUSHU: 'KYUSHU'
    }

    /**
     * The key identifying the tournament.
     * 
     * Expects one of `Tournament.Code`. 
     * @type {string}
     */
    code;
    /**
     * The schedule of the tournament as a list of dates.
     * @type {Date[]}
     */
    schedule;

    /**
     * Constructor.
     * 
     * It is recommended to use the `Init()` function to initialize an object.
     * @param {string} code the tournament code; expects one of `Tournament.Code`
     * @param {Date[]} schedule the tournament dates
     */
    constructor(code, schedule) {
        this.code = code;
        this.schedule = schedule;
    }

    /**
     * Initializes a new Tournament object.
     * @param {string} code the tournament code; expects one of `Tournament.Code`
     * @param {string[]} schedule the tournament dates in string format `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm:ss`
     * @returns a new object
     */
    static Init(code, schedule) {
        return new Tournament(code, schedule.map((date) => new Date(date)));
    }
}