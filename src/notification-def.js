// notification definition
const KEY_TYPE = "type";
const KEY_NAME = "name";
const KEY_DISPLAY_NAME = "display";
const KEY_VALUE = "value";

// *** conditions ***
// smaller than
const SMALLER_THAN = "st";
const SMALLER_THAN_DISPLAY = "Smaller Than"
const SMALLER_THAN_VALUE_THRESHOLD = "th"
const SMALLER_THAN_VALUE_THRESHOLD_DISPLAY = "Threshold"
// ******************

// notification condition table
const NOTIFICATION_TABLE = {
    "conditions":{
        SMALLER_THAN: {
            KEY_DISPLAY_NAME: SMALLER_THAN_DISPLAY,
            KEY_VALUE: [
                {
                    KEY_NAME: SMALLER_THAN_VALUE_THRESHOLD,
                    KEY_DISPLAY_NAME: SMALLER_THAN_VALUE_THRESHOLD_DISPLAY
                }
            ]
        }
    }
}

module.exports = {
    KEY_TYPE,
    KEY_NAME,
    KEY_DISPLAY_NAME,
    KEY_VALUE,
    SMALLER_THAN,
    SMALLER_THAN_DISPLAY,
    SMALLER_THAN_VALUE_THRESHOLD,
    SMALLER_THAN_VALUE_THRESHOLD_DISPLAY,
    NOTIFICATION_TABLE
}