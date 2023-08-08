const { ActivityType } = require('discord.js');

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        let status = [
            { name: 'you vote for your servers! ✅', type: ActivityType.Watching },
            { name: 'you take a cat nap 😴', type: ActivityType.Watching },
            { name: 'you get zombified! 🧟‍♂️', type: ActivityType.Watching },
            { name: 'zlg.gg 🔗', type: ActivityType.Watching },
            { name: 'for support tickets! 🎫', type: ActivityType.Watching }
        ];

        setInterval(() => {
            let random = Math.floor(Math.random() * status.length);
            client.user.setActivity(status[random]);
        }, 10000);
    },
};