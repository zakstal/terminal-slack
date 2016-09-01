var notifier = require('node-notifier');
var path     = require('path');


exports.slackNotification = function (title, message) {
  notifier.notify({
                    'title': "Slack: " + title,
                    icon: path.join(__dirname, 'slack.png'),
                    'message': message
                  })
};