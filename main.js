/**
 * Entry point. Inits the rtm, gets the channels and users, then sets up the event listeners
 * for entering rooms and sending messages.
 *
 * TODO: refactor for clarity and use of different room types.
 */

var ui = require('./userInterface.js'),
    slack = require('./slackClient.js'),
    //fs = require('fs'),
    components = ui.init(), // ui components
    users,
    channels,
    currentChannelId,

    // generates ids for messages
    getNextId = (function() {
        var id = 0;
        return function() {
            return id += 1;
        };
    })();

// inits the rtm
slack.init(function(data, ws) {
    var currentUser = data.self;

    // don't update focus until ws is connected
    // focus on the channel list
    components.channelList.select(0);
    components.channelList.focus();
    // re render screen
    components.screen.render();

    ws.on('message', function(message, flags){
        message = JSON.parse(message);

        if ('reply_to' in message) {
            handleSentConfirmation(message);
        }
        else if (message.type === 'message') {
            handleNewMessage(message);
        }
    });

    // initialize these event handlers here as they allow functionality
    // that relies on websockets

    // event handler when message is submitted
    components.messageInput.on('submit', function(text) {
        var id = getNextId();
        components.messageInput.clearValue();
        components.messageInput.focus();
        components.chatWindow.insertBottom(
            '{bold}' + currentUser.name + '{/bold}: ' + text +
            ' (pending - ' + id +' )'
        );
        components.chatWindow.scroll(1);

        components.screen.render();
        ws.send(JSON.stringify({
            id: id,
            type: 'message',
            channel: currentChannelId,
            text: text
        }));
    });
});

// set the channel list
components.channelList.setItems(['Connecting to Slack...']);
components.screen.render();

// get list of users and set channel list
// TODO: kill callback chaining
slack.getUsers(function(response, error, data){
    users = JSON.parse(data).members;

    // set the channel list to the channels returned from slack
    slack.getRooms(function(rooms){
        components.channelList.setItems(
            rooms.map(function(room) {
                if (room.name) return room.name;
                for (var i = users.length - 1; i >= 0; i -= 1) // is a user
                    if (room.user == users[i].id) return users[i].name;
                return room.user;
            })
        );
        components.screen.render();
    });
});

// event handler when user selects a channel
components.channelList.on('select', function(data) {
    var channelName = data.content;

    // a channel was selected
    components.mainWindowTitle.setContent('{bold}' + channelName + '{/bold}');
    components.chatWindow.setContent('Getting messages...');
    components.screen.render();

    // join the selected channel
    slack.joinRoom('channels', channelName, function(error, response, data) {
        if (error || response.statusCode != 200) {
            console.log('Error: ', error, response || response.statusCode);
            return;
        }

        data = JSON.parse(data);
        currentChannelId = data.channel.id;

        // get the previous messages of the channel and display them
        slack.getRoomHistory('channels', currentChannelId, function(error, response, data) {
            if (error || response.statusCode != 200) {
                console.log('Error: ', error, response || response.statusCode);
                return;
            }

            data = JSON.parse(data);
            components.chatWindow.deleteTop(); // remove loading message

            // filter and map the messages before displaying them
            data.messages
                .filter(function(item) {
                    return (item.type === 'message');
                })
                .map(function(message) {
                    var len = users.length,
                        username;

                    // get the author
                    for(var i=0; i < len; i++) {
                        if (message.user === users[i].id) {
                            username = users[i].name;
                        }
                    }

                    return {text: message.text, username: username};
                })
                .forEach(function(message) {
                    // add messages to window
                    components.chatWindow.unshiftLine(
                        '{bold}' + message.username + '{/bold}: ' + message.text
                    );
                });

            // reset messageInput and give focus
            components.messageInput.clearValue();
            components.chatWindow.scrollTo(components.chatWindow.getLines().length);
            components.messageInput.focus();
            components.screen.render();

            // mark the most recently read message
            slack.markChannel(currentChannelId, data.latest);
        });
    });
});

// handles the reply to say that a message was successfully sent
function handleSentConfirmation(message) {
    // for some reason getLines gives an object with int keys
    var lines = components.chatWindow.getLines(),
        keys = Object.keys(lines),
        line, i;
    for(i=keys.length - 1; i >= 0; i--){
        line = lines[keys[i]].split('(pending - ');
        if (parseInt(line.pop()[0]) === message.reply_to) {

            components.chatWindow.deleteLine(parseInt(keys[i]));

            if (message.ok) {
                components.chatWindow.insertLine(i, line.join(''));
            }
            else {
                components.chatWindow.insertLine(i, line.join('') + ' (FAILED)');
            }
            break;
        }
    }
    components.chatWindow.scroll(1);
    components.screen.render();
}

function handleNewMessage(message) {
    if(message.channel !== currentChannelId) {
        return;
    }

    var len = users.length,
        username;

    // get the author
    for(var i=0; i < len; i++) {
        if (message.user === users[i].id) {
            username = users[i].name;
        }
    }
    components.chatWindow.insertBottom(
        '{bold}' + username + '{/bold}: ' + message.text
    );
    components.chatWindow.scroll(1);
    components.screen.render();
}
