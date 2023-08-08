const {
    channelIDs,
    message,
    messageIntervalSeconds,
} = require('../../config.json');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log('⌛ Attempting to start reminder...');
        const date = new Date();

        console.log(`❗ Reminder Ready! \n🟢 Broadcasting to the following channels:`);
        channelIDs.forEach(id =>
            client.channels
                .fetch(id)
                .then((channel) =>
                    console.log(channel.name))
        );

        setupInterval(client);
    },
};

function setupInterval(client) {
    setInterval(() => onInterval(client), messageIntervalSeconds * 1000);
}

function onInterval(client) {
    channelIDs.forEach(id =>
        client.channels
            .fetch(id)
            .then((channel) => sendMessage(channel)));
}

function sendMessage(channel) {
    channel.send(message);
    console.log(`ReminderBot message sent to ${channel.name} channel on ${new Date()}`);
}
