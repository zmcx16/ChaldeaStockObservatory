// notification definition
const KEY_TYPE = "type";
const KEY_NAME = "name";
const KEY_CONDITIONS = "conditions";
const KEY_DISPLAY_NAME = "display";
const KEY_VALUE = "value";
const KEY_ARGS = "args";

const KEY_MESSAGES = "messages";
const KEY_TRIGGER = "trigger";


// *** conditions ***
// ArrivalPrice
const ARRIVAL_PRICE = "ArrivalPrice";
const ARRIVAL_PRICE_DISPLAY = "Arrival Price"
const ARRIVAL_PRICE_GREATERTHAN = "GreaterThan"
const ARRIVAL_PRICE_GREATERTHAN_DISPLAY = "Greater Than"
const ARRIVAL_PRICE_LESSTHAN = "LessThan"
const ARRIVAL_PRICE_LESSTHAN_DISPLAY = "Less Than"
// ******************

// notification condition table
const NOTIFICATION_TABLE = {
    KEY_CONDITIONS:{
        ARRIVAL_PRICE: {
            KEY_DISPLAY_NAME: ARRIVAL_PRICE_DISPLAY,
            KEY_VALUE: [
                {
                    KEY_NAME: ARRIVAL_PRICE_GREATERTHAN,
                    KEY_DISPLAY_NAME: ARRIVAL_PRICE_GREATERTHAN_DISPLAY
                },
                {
                    KEY_NAME: ARRIVAL_PRICE_LESSTHAN,
                    KEY_DISPLAY_NAME: ARRIVAL_PRICE_LESSTHAN_DISPLAY
                }
            ]
        }
    }
}

module.exports = {
    KEY_TYPE,
    KEY_NAME,
    KEY_CONDITIONS,
    KEY_DISPLAY_NAME,
    KEY_VALUE,
    KEY_ARGS,
    KEY_MESSAGES,
    KEY_TRIGGER,
    ARRIVAL_PRICE,
    ARRIVAL_PRICE_DISPLAY,
    ARRIVAL_PRICE_GREATERTHAN,
    ARRIVAL_PRICE_GREATERTHAN_DISPLAY,
    ARRIVAL_PRICE_LESSTHAN,
    ARRIVAL_PRICE_LESSTHAN_DISPLAY,
    NOTIFICATION_TABLE
}