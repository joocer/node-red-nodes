// this node waits 30 seconds before forwarding on a deactivate message
// it was written to run on a motion sensor, rather than turn the light off
// immediately on deactive, it waits another 30 seconds
// this isn't just implemented with a in-built trigger because it doesn't 
// support resetting the clock on an arbitrary attribute


// when there's multiple presence sensors for the same location
// treat them like a group, send when one is activated, not when each
if (msg.payload.event == 'activated') 
{
    var flag = flow.get(msg.payload.location);
    if (flag === undefined) 
    { 
        flag = 1;
    }
    else 
    { 
        flag++;
    }
    flow.set(msg.payload.location, flag);
    node.status({fill:"yellow",shape:"dot",text: msg.payload.location + ' [' + flag + ']' });
    return msg;
}

if (msg.payload.event == 'deactivated') {
    var flag = flow.get(msg.payload.location);
    if (flag === undefined || flag <= 0) { return null }
    node.status({fill:"blue",shape:"dot",text: msg.payload.location + ' [' + flag + ']' });
    
    setTimeout(function(){
        var flag = flow.get(msg.payload.location);
        flag--;
        if (flag === undefined || flag <= 0)
        {
            node.status({fill:"black",shape:"dot",text: msg.payload.location });
            node.send(msg);
        }
        else 
        {
            node.status({fill:"blue",shape:"dot",text: msg.payload.location + ' [' + flag + ']' });
        }
        flow.set(msg.payload.location, flag);
    }, 30000);
}
return null;
