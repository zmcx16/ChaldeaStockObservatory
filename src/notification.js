// def

// var
var notification_data = {
    "data": [
        {
            "symbol": "INTC",
            "openP": "45.83",
            "highP": "46.42",
            "lowP": "45.55",
            "closeP": "46.19",
            "volume": "15.38M",
            "enable": true,
            "edit": [
                {
                    "name": "C1",
                    "type": "st",
                    "value": {
                        "st_p": 10,
                        "st_v": 4
                    }
                }
            ]
        }
    ]
}

$(document).ready(function () {

});

// main function


/* template data */
const notification_container_template = `
<li class="item stock_{name}">
    <div class="status-tab"></div>
    <div class="drag-tab">
    <div></div>
    <div></div>
    <div></div>
    </div>
    <div class="check-tab-wrap">
    <div class="custom-control custom-checkbox check-tab">
        <input type="checkbox" class="custom-control-input" id="checkbox-{checkbox}" name="stock-checkbox">
        <label class="custom-control-label" for="checkbox-{checkbox}"></label>
    </div>
    </div>
    <span class="list-cell symbol">{symbol}</span>
    <span class="list-cell openP">{openP}</span>
    <span class="list-cell highP">{highP}</span>
    <span class="list-cell lowP">{lowP}</span>
    <span class="list-cell closeP">{closeP}</span>
    <span class="list-cell volume">{volume}</span>
    <div class="list-cell edit-btn"><button id="edit-button" type="button" class="click-btn-v1">Edit</button></div>
    <div class="list-cell enable-btn"><button id="enable-button" type="button">Enable</button></div>
</li>
`;