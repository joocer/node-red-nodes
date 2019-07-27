// this node waits 30 seconds before forwarding on a deactivate message
// it was written to run on a motion sensor, rather than turn the light off
// immediately on deactive, it waits another 30 seconds
// this isn't just implemented with a in-built trigger because it doesn't 
// support resetting the clock on an arbitrary attribute

const WAIT_TIME = 30000;  // 30 seconds

function can_deactivate(){
    var last_activation = flow.get(msg.payload.location);
    if (last_activation === undefined) { return null }
    var waited = Date.now() - last_activation;
    
    if (waited >= WAIT_TIME)
    {
        node.status({fill:"black",shape:"dot",text: msg.payload.location });
        node.send(msg);
    }
    else { return null }
}


// when there's multiple presence sensors for the same location
// treat them like a group, send when one is activated, not when each
if (msg.payload.event == 'activated') 
{
    flow.set(msg.payload.location, Date.now());
    node.status({fill:"yellow",shape:"dot",text: msg.payload.location });
    return msg;
}

if (msg.payload.event == 'deactivated') {
    var last_activation = flow.get(msg.payload.location);
    if (last_activation === undefined) { return null }
    node.status({fill:"blue",shape:"dot",text: msg.payload.location });
    setTimeout(can_deactivate, WAIT_TIME);
}

return null;
