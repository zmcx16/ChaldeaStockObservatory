// common function
function getPosition(element) {
    var x = 0;
    var y = 0;
    while (element) {
        x += element.offsetLeft - element.scrollLeft + element.clientLeft;
        y += element.offsetTop - element.scrollLeft + element.clientTop;
        element = element.offsetParent;
    }

    return { x: x, y: y };
}

// drag item
function dragList() {
    var x, y, mx, my, lastItem;

    //drag-tab click event
    $(document).on("mousedown", ".drag-tab", function (mouse) {
        mx = mouse.clientX;
        my = mouse.clientY;
        x = mx - $(this).parent().offset().left;
        y = my - $(this).parent().offset().top;

        var width = $(this).parent().width();
        var height = $(this).parent().height();
        lastItem = $(".item:last").offset().top + ($(".item:last").height() / 2);

        $(this).parent().css({ "width": width, "height": height });
        $(this).parent().after("<li id='place-holder'></li>");
        $("#place-holder").css({ "height": $(this).height() });
        $(this).parent().addClass("draggable");
    });

    //drag event
    $(document).on("mousemove", function (mouse) {
        var holdPlace = $("#place-holder");
        if ($(".item").hasClass("draggable")) {
            mx = mouse.clientX;
            my = mouse.clientY;

            var item = $(".item");

            for (var i = item.length - 1; i >= 0; i--) {
                if (!$(item[i]).hasClass("draggable")) {
                    //if(true) {
                    var dragTop = $(".draggable").offset().top;
                    var noDrag = $(item[i]).offset().top + ($(item[i]).height() / 2);

                    //console.log(lastItem);
                    if (dragTop > lastItem) {
                        //console.log($(item[i]).html());
                        $("#place-holder").remove();
                        $("#list").append(holdPlace);
                    }
                    if (dragTop < noDrag) {
                        //console.log($(item[i]).html());
                        $("#place-holder").remove();
                        $(item[i]).before(holdPlace);
                    }
                }
            }
            $(".draggable").css({ "top": my - y });//, "left" : mx - x });
        }
    });
    //mouse release event
    $(document).on("mouseup", function () {
        if ($(".item").hasClass("draggable")) {
            deselect();
        }
        var toPlace = $(".draggable");
        $(".draggable").remove();
        //console.log(toPlace);
        $(document).find("#place-holder").after(toPlace).remove();
        $(".item").attr("style", "").removeClass("draggable");
        //console.log($(".item"));
    });
    function deselect() {
        if (window.getSelection) {
            if (window.getSelection().empty) {  // Chrome
                window.getSelection().empty();
            } else
                if (window.getSelection().removeAllRanges) {  // Firefox
                    window.getSelection().removeAllRanges();
                }
        } else
            if (document.selection) {  // IE?
                document.selection.empty();
            }
    }
}

// Date format
function formatDate(date, format, utc) {
    var MMMM = ["\x00", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var MMM = ["\x01", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var dddd = ["\x02", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var ddd = ["\x03", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    function ii(i, len) {
        var s = i + "";
        len = len || 2;
        while (s.length < len) s = "0" + s;
        return s;
    }

    var y = utc ? date.getUTCFullYear() : date.getFullYear();
    format = format.replace(/(^|[^\\])yyyy+/g, "$1" + y);
    format = format.replace(/(^|[^\\])yy/g, "$1" + y.toString().substr(2, 2));
    format = format.replace(/(^|[^\\])y/g, "$1" + y);

    var M = (utc ? date.getUTCMonth() : date.getMonth()) + 1;
    format = format.replace(/(^|[^\\])MMMM+/g, "$1" + MMMM[0]);
    format = format.replace(/(^|[^\\])MMM/g, "$1" + MMM[0]);
    format = format.replace(/(^|[^\\])MM/g, "$1" + ii(M));
    format = format.replace(/(^|[^\\])M/g, "$1" + M);

    var d = utc ? date.getUTCDate() : date.getDate();
    format = format.replace(/(^|[^\\])dddd+/g, "$1" + dddd[0]);
    format = format.replace(/(^|[^\\])ddd/g, "$1" + ddd[0]);
    format = format.replace(/(^|[^\\])dd/g, "$1" + ii(d));
    format = format.replace(/(^|[^\\])d/g, "$1" + d);

    var H = utc ? date.getUTCHours() : date.getHours();
    format = format.replace(/(^|[^\\])HH+/g, "$1" + ii(H));
    format = format.replace(/(^|[^\\])H/g, "$1" + H);

    var h = H > 12 ? H - 12 : H == 0 ? 12 : H;
    format = format.replace(/(^|[^\\])hh+/g, "$1" + ii(h));
    format = format.replace(/(^|[^\\])h/g, "$1" + h);

    var m = utc ? date.getUTCMinutes() : date.getMinutes();
    format = format.replace(/(^|[^\\])mm+/g, "$1" + ii(m));
    format = format.replace(/(^|[^\\])m/g, "$1" + m);

    var s = utc ? date.getUTCSeconds() : date.getSeconds();
    format = format.replace(/(^|[^\\])ss+/g, "$1" + ii(s));
    format = format.replace(/(^|[^\\])s/g, "$1" + s);

    var f = utc ? date.getUTCMilliseconds() : date.getMilliseconds();
    format = format.replace(/(^|[^\\])fff+/g, "$1" + ii(f, 3));
    f = Math.round(f / 10);
    format = format.replace(/(^|[^\\])ff/g, "$1" + ii(f));
    f = Math.round(f / 10);
    format = format.replace(/(^|[^\\])f/g, "$1" + f);

    var T = H < 12 ? "AM" : "PM";
    format = format.replace(/(^|[^\\])TT+/g, "$1" + T);
    format = format.replace(/(^|[^\\])T/g, "$1" + T.charAt(0));

    var t = T.toLowerCase();
    format = format.replace(/(^|[^\\])tt+/g, "$1" + t);
    format = format.replace(/(^|[^\\])t/g, "$1" + t.charAt(0));

    var tz = -date.getTimezoneOffset();
    var K = utc || !tz ? "Z" : tz > 0 ? "+" : "-";
    if (!utc) {
        tz = Math.abs(tz);
        var tzHrs = Math.floor(tz / 60);
        var tzMin = tz % 60;
        K += ii(tzHrs) + ":" + ii(tzMin);
    }
    format = format.replace(/(^|[^\\])K/g, "$1" + K);

    var day = (utc ? date.getUTCDay() : date.getDay()) + 1;
    format = format.replace(new RegExp(dddd[0], "g"), dddd[day]);
    format = format.replace(new RegExp(ddd[0], "g"), ddd[day]);

    format = format.replace(new RegExp(MMMM[0], "g"), MMMM[M]);
    format = format.replace(new RegExp(MMM[0], "g"), MMM[M]);

    format = format.replace(/\\(.)/g, "$1");

    return format;
}

function needEnableSync(sync_data) {
    // check if keep sync data
    let time_now = new Date();
    let timestamp_now = Math.floor(time_now.getTime() / 1000);

    let day_start_int = parseInt(sync_data['day_start']);
    let day_start = new Date(time_now.getFullYear(), time_now.getMonth(), time_now.getDate(), day_start_int / 100, day_start_int % 100);
    let timestamp_start = Math.floor(day_start.getTime() / 1000);

    let day_end_int = parseInt(sync_data['day_end']);
    let day_end = new Date(time_now.getFullYear(), time_now.getMonth(), time_now.getDate(), day_end_int / 100, day_end_int % 100);
    let timestamp_end = Math.floor(day_end.getTime() / 1000);

    if (timestamp_start > timestamp_end) {
        if (timestamp_now < timestamp_start) {
            timestamp_start -= (60 * 60 * 24);
            day_start.setDate(day_start.getDate() - 1);
        } else {
            timestamp_end += (60 * 60 * 24);
            day_end.setDate(day_end.getDate() + 1);
        }
    }

    if (timestamp_now >= timestamp_start && timestamp_now <= timestamp_end && sync_data['week'][day_start.getDay()]) {
        return true;
    }
    else {
        return false;
    }
}

function updateOHLCV_UI(stock, syncing, update_status) {

    updateCol(stock['symbol'], 'openP', stock['openP']);
    updateCol(stock['symbol'], 'highP', stock['highP']);
    updateCol(stock['symbol'], 'lowP', stock['lowP']);
    updateCol(stock['symbol'], 'closeP', stock['closeP']);
    updateCol(stock['symbol'], 'volume', stock['volume']);
    updateCol(stock['symbol'], 'changeP', stock['changeP']);
    updateStockColor($('.item.stock_' + stock['symbol'])[0]);

    update_status[stock['symbol']] = true;
    let update_cnt = Object.keys(update_status).length;
    let total_num = $('.item').length;
    if ($('#update-progress').length && update_cnt < total_num) {
        $('#update-progress')[0].style.width = (update_cnt * 100 / total_num).toString() + '%';
        $('#update-progress')[0].innerHTML = (Math.round(update_cnt * 100 / total_num)).toString() + '%';
    } else {
        $('#update-progress')[0].style.width = '100%';
        $('#update-progress')[0].innerHTML = '100%';
    }

    let led = "led-blue";
    if (syncing) {
        led = "led-green";
    }

    let d = new Date();
    $('#last-update-time')[0].innerHTML = '<div class="' + led + '" id="last-update-time-led"></div>' + formatDate(d, "MM/dd") + "&nbsp;&nbsp;&nbsp;" + formatDate(d, "hh:mm:ss");
}

function updateCol(symbol, label, value) {
    let target = $('.item.stock_' + symbol + ' .list-cell.' + label)[0];
    if (target) {
        target.innerText = value;
    }
}

function updateStocksColor() {

    let item_list = $('.item');
    item_list.each(function (row_index) {
        updateStockColor(item_list[row_index]);
    });
}

function updateStockColor(target) {

    let change = $(target).children('.list-cell.changeP');
    let sign = Math.sign(parseFloat($(change[0])[0].innerText));
    if (sign === 1) {
        $(change[0]).attr('style', 'color:green;');
    } else if (sign == -1) {
        $(change[0]).attr('style', 'color:red;');
    } else {
        $(change[0]).attr('style', 'color:black;');
    }
}
