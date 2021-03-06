// *** conditions ***
// Name
const NAME = "NAME"
const NAME_DISPLAY = "Name"

// ArrivalPrice
const ARRIVAL_PRICE = "ArrivalPrice";
const ARRIVAL_PRICE_DISPLAY = "Arrival Price"
const ARRIVAL_PRICE_GREATERTHAN = "GreaterThan"
const ARRIVAL_PRICE_GREATERTHAN_DISPLAY = "Greater Than"
const ARRIVAL_PRICE_LESSTHAN = "LessThan"
const ARRIVAL_PRICE_LESSTHAN_DISPLAY = "Less Than"
// ******************

// TrailingStop
const TRAILING_STOP = "TrailingStop";
const TRAILING_STOP_DISPLAY = "Trailing Stop"
const TRAILING_STOP_STARTDATE = "StartDate"
const TRAILING_STOP_STARTDATE_DISPLAY = "Start Date (yyyymmdd)"
const TRAILING_STOP_SELLAMT = "SellAmt"
const TRAILING_STOP_SELLAMT_DISPLAY = "Sell (amt)"
const TRAILING_STOP_SELLP = "SellP"
const TRAILING_STOP_SELLP_DISPLAY = "Sell (%)"
const TRAILING_STOP_BUYAMT = "BuyAmt"
const TRAILING_STOP_BUYAMT_DISPLAY = "Buy (amt)"
const TRAILING_STOP_BUYP = "BuyP"
const TRAILING_STOP_BUYP_DISPLAY = "Buy (%)"
// ******************

// notification condition table
const NOTIFICATION_TABLE = {
    KEY_CONDITIONS:{
        [ARRIVAL_PRICE]: {
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
        },
        [TRAILING_STOP]: {
            KEY_DISPLAY_NAME: TRAILING_STOP_DISPLAY,
            KEY_VALUE: [
                {
                    KEY_NAME: TRAILING_STOP_STARTDATE,
                    KEY_DISPLAY_NAME: TRAILING_STOP_STARTDATE_DISPLAY
                },
                {
                    KEY_NAME: TRAILING_STOP_SELLAMT,
                    KEY_DISPLAY_NAME: TRAILING_STOP_SELLAMT_DISPLAY
                },
                {
                    KEY_NAME: TRAILING_STOP_SELLP,
                    KEY_DISPLAY_NAME: TRAILING_STOP_SELLP_DISPLAY
                },
                {
                    KEY_NAME: TRAILING_STOP_BUYAMT,
                    KEY_DISPLAY_NAME: TRAILING_STOP_BUYAMT_DISPLAY
                },
                {
                    KEY_NAME: TRAILING_STOP_BUYP,
                    KEY_DISPLAY_NAME: TRAILING_STOP_BUYP_DISPLAY
                }
            ]
        }
    }
}

module.exports = {
    NAME, 
    NAME_DISPLAY,
    ARRIVAL_PRICE,
    ARRIVAL_PRICE_DISPLAY,
    ARRIVAL_PRICE_GREATERTHAN,
    ARRIVAL_PRICE_GREATERTHAN_DISPLAY,
    ARRIVAL_PRICE_LESSTHAN,
    ARRIVAL_PRICE_LESSTHAN_DISPLAY,
    TRAILING_STOP,
    TRAILING_STOP_DISPLAY,
    TRAILING_STOP_STARTDATE,
    TRAILING_STOP_STARTDATE_DISPLAY,
    TRAILING_STOP_SELLAMT,
    TRAILING_STOP_SELLAMT_DISPLAY,
    TRAILING_STOP_SELLP,
    TRAILING_STOP_SELLP_DISPLAY,
    TRAILING_STOP_BUYAMT,
    TRAILING_STOP_BUYAMT_DISPLAY,
    TRAILING_STOP_BUYP,
    TRAILING_STOP_BUYP_DISPLAY,
    NOTIFICATION_TABLE
}