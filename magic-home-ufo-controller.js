// this node controls magic-home UFO WiFi LED controllers
// you need to set the STYLE to match the controller, RGBW and RGBWW are implemented
// accepts:
//  on [true|false]
//  color [#RRGGBB]
//  brightness [0..255]
//
// in JSON format { on: true, color: '#FFFFFF' }

var ONCOMMAND = new Buffer('7123F084', 'hex');
var OFFCOMMAND = new Buffer('7124F085', 'hex');
var QUERYCOMMAND = new Buffer('818A8B96', 'hex');
var COLORCOMMAND;
var STYLE = 'RGBWW'; 

var checkbit;
if (STYLE == 'RGBWW') {
    checkbit = function(command) { command[8] = (command[0] + command[1] + command[2] + command[3] + command[4] + command[5] + command[6] + command[7]) % 256; return command; };
    COLORCOMMAND = [49, 255, 255, 255, 255, 255, 240, 15, 255];
}
else {
    checkbit = function (command) { command[7] = (command[0] + command[1] + command[2] + command[3] + command[4] + command[5] + command[6]) % 256; return command; };
    COLORCOMMAND = [49, 255, 255, 255, 0, 0, 240, 15, 255];
}

function setColor(color) {
    var colorRed = parseInt(color.substring(1, 3), 16) || 0;
    var colorGreen = parseInt(color.substring(3, 5), 16) || 0;
    var colorBlue = parseInt(color.substring(5, 7), 16) || 0;
    var colorWhite = parseInt(color.substring(7, 9), 16) || 0;

    var command = COLORCOMMAND;
    command[1] = colorRed;  
    command[2] = colorGreen;
    command[3] = colorBlue; 
    command[4] = colorWhite;
    command = checkbit(command);
    return Buffer.from(command);
}

function setBrightness(brightness) {
    function DecToHexString(num, len) {
        str = num.toString(16).toUpperCase();
        return "0".repeat(len - str.length) + str;
    }
    if (isNaN(brightness)) { brightness = 100 }
    if (brightness > 100) { brightness = 100 }
    if (brightness < 0) { brightness = 0 }
    var adjustment = Math.round((brightness / 100) * 255);
    var hex = DecToHexString(adjustment);
    return (setColor('#' + hex + hex + hex + hex + hex));
}

if (msg.payload.on !== undefined) {
    switch (msg.payload.on) {
        case true:
            node.send({ "payload": ONCOMMAND });
            context.set("on",true);
            node.status({fill:"yellow", shape:"ring", text:' '});
            break;
        case false:
            node.send({ "payload": OFFCOMMAND });
            context.set("on",false);
            node.status({fill:"black", shape:"ring", text:' '});
            break;
    }
}
if (msg.payload.toggle !== undefined) {
    var state = context.get("on");
    if (state) {
        node.send({ "payload": OFFCOMMAND });
        context.set("on",false);
        node.status({fill:"black", shape:"ring", text:' '});  
    }
    else {
        node.send({ "payload": ONCOMMAND });
        context.set("on",true);
        node.status({fill:"yellow", shape:"ring", text:' '});
    }
}
setTimeout(function() {
    // this delays the color/brightness commands 250ms
    if (msg.payload.brightness !== undefined) {
        node.send({ "payload": setBrightness(msg.payload.brightness) });
    }
    if (msg.payload.color !== undefined) {
        node.send({ "payload": setColor(msg.payload.color) });
    }
}, 250);
return;