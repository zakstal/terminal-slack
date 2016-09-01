var request = require('request'),
    WebSocket = require('ws'),
    TOKEN = process.env.SLACK_TOKEN;

module.exports = {
    init: function(callback) {
        console.log("this is the token", TOKEN);
        var self = this;
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
            if (data.ok) {
                var ws = new WebSocket(data.url);
                callback(data, ws);
            } else {
                console.log('error in slackClient.js init: error message', data)
            }
        });
    },
    getChannels: function(callback) {

        request.get({
            url: 'https://slack.com/api/channels.list',
            qs: {
                token: TOKEN,
            }
        },
        function(error, response, data) {
            if(callback) callback(error, response, data);
        });
    },
    joinChannel: function(name, callback) {
        request.get({
            url: 'https://slack.com/api/channels.join',
            qs: {
                token: TOKEN,
                name: name
            }
        },
        function(error, response, data) {
            if(callback) callback(error, response, data);
        });
    },
    getChannelHistory: function(id, callback) {
        request.get({
            url: 'https://slack.com/api/channels.history',
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
    },
    getIms: function(callback) {
        request.get({
            url: 'https://slack.com/api/im.list',
            qs: {
                token: TOKEN,
            }
        },
        function(error, response, data) {
            if(callback) callback(error, response, data);
        });
    },
    getImHistory: function(channel, callback) {
        request.get({
                url: 'https://slack.com/api/im.history',
                qs: {
                    token: TOKEN,
                    channel: channel
                }
            },
            function(error, response, data) {
                if(callback) callback(error, response, data);
            });
    },
    openDirectIm: function(userId, callback) {
        request.get({
                url: 'https://slack.com/api/im.open',
                qs: {
                    token: TOKEN,
                    user: userId
                }
            },
            function(error, response, data) {
                if(callback) callback(error, response, data);
            });
    }
};
