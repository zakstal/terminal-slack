var blessed = require('blessed');

module.exports = {

    init: function() {
        var screen = blessed.screen({
            autopadding: true,
            smartCSR: true,
            title: 'Slack'
            }),

            container = blessed.box({
                width: '100%',
                height: '100%',
                style: {
                    fg: '#bbb',
                    bg: '#1d1f21'
                }
            }),

            sideBar = blessed.box({
                width: '20%',
                height: '100%',
                left: '10%',
                border: {
                    type: 'line'
                },
                style: {
                    border: {
                        fg: 'white',
                        bg: 'white'
                    }
                }

            }),

            sideBarTitle = blessed.text({
                width: '90%',
                left: '5%',
                align: 'center',
                content: '{bold}Channels{/bold}',
                tags: true
            }),

            sideBarSubTitle = blessed.text({
                width: '90%',
                left: '5%',
                align: 'center',
                content: '{bold}Users{/bold}',
                tags: true
            }),

            channelContainer = blessed.box({
                width: '95%',
                height: '50%',
                top: '-2%',
                border: {
                    type: 'line'
                },
                style: {
                    border: {
                        fg: '#888'
                    }
                }
            }),

            usersContainer = blessed.box({
                width: '95%',
                height: '50%',
                top: '49%',
                border: {
                    type: 'line'
                },
                style: {
                    border: {
                        fg: '#888'
                    }
                }
            }),

            channelList = blessed.list({
                width: '90%',
                height: '80%',
                left: '5%',
                top: '14%',
                keys: true,
                vi: true,
                style: {
                    selected: {
                        bg: '#373b41',
                        fg: '#c5c8c6'
                    }
                },
                tags: true
            }),

            userList = blessed.list({
                width: '90%',
                height: '80%',
                left: '5%',
                top: '14%',
                keys: true,
                vi: true,
                style: {
                    selected: {
                        bg: '#373b41',
                        fg: '#c5c8c6'
                    }
                },
                tags: true
            }),

            otherGroup = blessed.box({
                width: '10%',
                height: '100%',
                border: {
                    type: 'line'
                },
                style: {
                    border: {
                        fg: '#888'
                    }
                }

            }),

            mainWindow = blessed.box({
                width: '70%',
                height: '100%',
                left: '30%',
                //scrollable: true,
                border: {
                    type: 'line'
                },
                style: {
                    border: {
                        fg: '#888'
                    }
                }
            }),

            mainWindowTitle = blessed.text({
                width: '90%',
                tags: true
            }),

            chatWindow = blessed.box({
                width: '90%',
                height: '75%',
                left: '5%',
                top: '10%',
                scrollable: true,
                alwaysScroll: true,
                tags: true
            }),

            messageInput = blessed.textbox({
                width: '90%',
                left: '5%',
                top: '85%',
                keys: true,
                inputOnFocus: true,
                border: {
                    type: 'line'
                }
            });

        channelContainer.append(sideBarTitle);
        channelContainer.append(channelList);
        usersContainer.append(sideBarSubTitle);
        usersContainer.append(userList);
        sideBar.append(channelContainer);
        sideBar.append(usersContainer);
        mainWindow.append(mainWindowTitle);
        mainWindow.append(chatWindow);
        mainWindow.append(messageInput);
        container.append(sideBar);
        container.append(otherGroup);
        container.append(mainWindow);
        screen.append(container);

        function keyBindings(ch, key) {
            switch (key.full) {
                case 'escape': process.exit(0);
                    break;
                case 'C-c': channelList.focus(); // ctrl-c for channels
                    break;
                case 'C-u': userList.focus(); // ctrl-u for users
                    break;
                case 'C-w': messageInput.focus(); // ctrl-w for write
                    break;
                case 'C-l': chatWindow.focus(); // ctrl-l for message list
                    break;
            }
            return;
        }

        // Quit on Escape or Control-C.
        //channelList.on('mousedown', channelList.focus);
        //userList.on('mousedown', userList.focus);
        //chatWindow.on('mousedown', chatWindow.focus);
        //messageInput.on('mousedown', messageInput.focus);

        channelList.on('keypress', keyBindings);
        userList.on('keypress', keyBindings);
        chatWindow.on('keypress', keyBindings);
        messageInput.on('keypress', function(ch, key){
            if (    key.full === 'escape' ||
                    key.full === 'C-c'    ||
                    key.full === 'C-w'    ||
                    key.full === 'C-l'   ) {
                messageInput.cancel();
                keyBindings(ch, key);
            }
        });

        // scrolling in chat window
        chatWindow.on('keypress', function(ch, key) {
            if (key.name === 'up') {
                chatWindow.scroll(-1);
                screen.render();
                return;
            }
            if (key.name === 'down') {
                chatWindow.scroll(1);
                screen.render();
                return;
            }
        });

        // event handlers for focus and blur of inputs
        channelList.on('focus', function() {
            sideBar.style.border = {'fg': '#cc6666'};
            screen.render();
        });
        channelList.on('blur', function() {
            sideBar.style.border = {'fg': '#888'};
            screen.render();
        });
        userList.on('focus', function() {
            sideBar.style.border = {'fg': '#cc6666'};
            screen.render();
        });
        userList.on('blur', function() {
            sideBar.style.border = {'fg': '#888'};
            screen.render();
        });
        messageInput.on('focus', function() {
            messageInput.style.border = {'fg': '#cc6666'};
            screen.render();
        });
        messageInput.on('blur', function() {
            messageInput.style.border = {'fg': '#888'};
            screen.render();
        });
        chatWindow.on('focus', function() {
            mainWindow.style.border = {'fg': '#cc6666'};
            screen.render();
        });
        chatWindow.on('blur', function() {
            mainWindow.style.border = {'fg': '#888'};
            screen.render();
        });

        return {
            screen: screen,
            sideBar: sideBar,
            sideBarTitle: sideBarTitle,
            sideBarSubTitle: sideBarSubTitle,
            userList: userList,
            channelList: channelList,
            otherGroup: otherGroup,
            mainWindow: mainWindow,
            mainWindowTitle: mainWindowTitle,
            chatWindow: chatWindow,
            messageInput: messageInput
        };
    }

};
