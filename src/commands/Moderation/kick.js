const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kicks a member from this server.')
        .addUserOption(option => option.setName('target-user').setDescription('The user you want to kick.').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason you want to kick.')),
    async execute(interaction, client) {
        const targetUserId = interaction.options.getUser('target-user').id;
        const reason = interaction.options.getString('reason') || 'No reason provided';

        await interaction.deferReply();

        const targetUser = await interaction.guild.members.fetch(targetUserId);

        if (!targetUser) {
            await interaction.editReply("That user doesn't exist in this server.");
            return;
        }

        if (targetUser.id === interaction.guild.ownerId) {
            await interaction.editReply("You can't kick that user because they're the server owner.");
            return;
        }

        const targetUserRolePosition = targetUser.roles.highest.position; // Highest role of the target user
        const requestUserRolePosition = interaction.member.roles.highest.position; // Highest role of the user running the cmd
        const botRolePosition = interaction.guild.members.me.roles.highest.position; // Highest role of the bot

        if (targetUserRolePosition >= requestUserRolePosition) {
            await interaction.editReply("You can't kick that user because they have the same/higher role than you.");
            return;
        }

        if (targetUserRolePosition >= botRolePosition) {
            await interaction.editReply("I can't kick that user because they have the same/higher role than me.");
            return;
        }

        // Kick the targetUser
        try {
            await targetUser.kick(reason);
            const embed = new EmbedBuilder()
                .setColor('RED')
                .setDescription(`🚫 User ${targetUser} was kicked\n🤔 Reason: ${reason}`)
                .setAuthor({ name: 'User Kicked', iconURL: targetUser.user.displayAvatarURL() })
                .setURL('https://discord.com/channels/646021483092770819/806559520481738783');

            await interaction.editReply({ embeds: [embed] });
            console.log(`🚫 User ${targetUser.user.tag} was kicked | Reason: ${reason}`);
        } catch (error) {
            console.log(`There was an error when kicking: ${error}`);
            await interaction.editReply('There was an error when kicking the user.');
        }
    },
};
