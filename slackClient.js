var request = require('request'),
    WebSocket = require('ws'),
    TOKEN = process.env.SLACK_TOKEN;

module.exports = {
    init: function(callback) {
        // sets up the real time messaging api
        request.get({
            url: 'https://slack.com/api/rtm.start',
            qs: {
                token: TOKEN
            }
        },
        function(error, response, data) {
            if (response.statusCode != 200) {
                console.log("Error: ", response.statusCode);
                return;
            }

            data = JSON.parse(data);
            var ws = new WebSocket(data.url);
            callback(data, ws);
        });
    },
    slackGet: function(url, callback) {
        request.get({
            url: url,
            qs: {
                token: TOKEN,
            }
        },
        function(error, response, data) {
            if(callback) callback(error, response, data);
        });
    },
    getChannels: function(callback) {
        this.slackGet('https://slack.com/api/channels.list', callback);
    },
    getIms: function(callback) {
        this.slackGet('https://slack.com/api/im.list', callback);
    },
    getGroups: function(callback) {
        this.slackGet('https://slack.com/api/groups.list', callback);
    },
    getRooms: function(callback) {
        var numResponses = 0,
            rooms = {
                channels: [],
                ims: [],
                groups: []
            };
        this.getChannels(onResponse.bind(null, 'channels'));
        this.getIms(onResponse.bind(null, 'ims'));
        this.getGroups(onResponse.bind(null, 'groups'));

        function onResponse(roomType, error, response, data){
            if (error || response.statusCode != 200) {
                console.log('Error: ', error, response || response.statusCode);
                return;
            }
            data = JSON.parse(data);
            rooms[roomType] = data[roomType].map(function(item) {
                item.type = roomType.slice(0, -1); // add type without 's'
                return item;
            });
            numResponses += 1;
            if (numResponses == 3 && callback) {
                callback(rooms.channels.concat(rooms.ims).concat(rooms.groups));
            }
        }
    },
    // roomType is 'channels', 'im', or 'group'
    joinRoom: function(roomType, name, callback) {
        request.get({
            url: 'https://slack.com/api/' + roomType + '.join',
            qs: {
                token: TOKEN,
                name: name
            }
        },
        function(error, response, data) {
            if(callback) callback(error, response, data);
        });
    },
    // roomType is 'channels', 'im', or 'group'
    getRoomHistory: function(roomType, id, callback) {
        request.get({
            url: 'https://slack.com/api/' + roomType + '.history',
            qs: {
                token: TOKEN,
                channel: id
            }
        },
        function(error, response, data) {
            if(callback) callback(error, response, data);
        });
    },
    markChannel: function(id, timestamp, callback) {
        request.get({
            url: 'https://slack.com/api/channels.mark',
            qs: {
                token: TOKEN,
                channel: id,
                ts: timestamp
            }
        },
        function(error, response, data) {
            if(callback) callback(error, response, data);
        });
    },
    getUsers: function(callback) {
        request.get({
            url: 'https://slack.com/api/users.list',
            qs: {
                token: TOKEN,
            }
        },
        function(error, response, data) {
            if(callback) callback(error, response, data);
        });
    }
};
