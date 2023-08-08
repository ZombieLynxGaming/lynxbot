const { SlashCommandBuilder } = require('@discordjs/builders');
const myUtils = require('../../utils/myUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll-d8')
        .setDescription('Rolls a D8 Dice!'),
    async execute(interaction, client) {
        await interaction.deferReply();

        const reply = await interaction.fetchReply();

        // Get the username of the user who triggered the command
        const username = interaction.user.username;

        // Convert the first letter of the username to uppercase
        const capitalizedUsername = username.charAt(0).toUpperCase() + username.slice(1);

        // Generate a random number between 1 and 8
        const randomNumber = Math.floor(Math.random() * 8) + 1;

        await interaction.editReply(`🎲 ${capitalizedUsername} rolled a D8 and got: ${randomNumber}!`);
    },
};
