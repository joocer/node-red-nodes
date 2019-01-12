// blocks repeat messages
// allows the first through but blocks subsequent ones until a different message is recieved
// this implementation is using a timestamp and device field, these could be changed to anything

var prevId = flow.get('messageId');
var thisId = msg.payload.timestamp + msg.payload.device;

if (prevId == thisId) { return null; }
flow.set('messageId', thisId);

msg.topic = msg.payload.device;

return msg;