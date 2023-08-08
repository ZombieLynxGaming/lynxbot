const { SlashCommandBuilder } = require('@discordjs/builders');
const myUtils = require('../../utils/myUtils');
const { suggest } = require('../../../config.json')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('suggest-empyrion')
        .setDescription('Submit a suggestion')
        .addStringOption(option =>
            option.setName('text')
                .setDescription('The suggestion you want to make')
                .setRequired(true)),
    async execute(interaction, client) {
        const suggestion = interaction.options.getString('text');

        // Find the suggestion channel by its ID
        const suggestionChannel = client.channels.cache.get(suggest.empyrion);

        if (!suggestionChannel) {
            return interaction.reply({ content: 'Unable to find the suggestion channel.', ephemeral: true });
        }

        // Create a suggestion embed
        const suggestionEmbed = {
            title: 'Suggestion:',
            description: `💬 ${myUtils.capitalize(suggestion)}`,
            author: {
                name: interaction.user.username,
                icon_url: interaction.user.displayAvatarURL(),
            },
        };

        // Send the suggestion to the suggestion channel
        const suggestionMessage = await suggestionChannel.send({ embeds: [suggestionEmbed] });

        // Add reactions to the suggestion message
        suggestionMessage.react('⬆️');
        suggestionMessage.react('⬇️');

        // Send an ephemeral message to the user
        await interaction.reply({ content: 'Your suggestion has been submitted. Thank you!', ephemeral: true });
        console.log(`🗳️  ${myUtils.capitalize(interaction.user.username)} made a suggestion: ${myUtils.capitalize(suggestion)}.`);

        // Delete the user's input message
        // interaction.message.delete();
    },
};
