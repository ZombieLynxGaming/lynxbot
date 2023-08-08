const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user from your server!')
        .addUserOption(option => option.setName('user').setDescription(`The member you want to ban`).setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription(`The reason for banning the member`).setRequired(true)),
    async execute(interaction, client) {

        const users = interaction.options.getUser('user');
        const ID = users.id;
        const banUser = client.users.cache.get(ID);

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return await interaction.reply({ content: "You do not have the permission to use this command" });
        if (interaction.member.id === ID) return await interaction.reply({ content: "You can not ban yourself!", ephemeral: true });

        let reason = interaction.options.getString('reason');
        if (!reason) reason = "No reason given";

        const dmEmbed = new EmbedBuilder()
            .setColor("Red")
            .setDescription(`🚫 You have been banned from **${interaction.guild.name}**.\n\n🤔 Reason: ${reason}.`)

        const embed = new EmbedBuilder()
            .setColor("Red")
            .setDescription(`🤔 Reason: ${reason}.`)
            .setAuthor({ name: `${banUser.tag} has been banned from Zombie Lynx Gaming! 🚫`, iconURL: banUser.displayAvatarURL(), url: 'https://discord.com/channels/646021483092770819/806559520481738783' })

        await interaction.guild.bans.create(banUser.id, { reason }).catch(err => {
            return interaction.reply({ content: "I can not ban this member!", ephemeral: true })
        })

        await banUser.send({ embeds: [dmEmbed] }).catch(err => {
            return;
        })

        await interaction.reply({ embeds: [embed] });
    }
};
