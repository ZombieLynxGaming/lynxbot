const { SlashCommandBuilder } = require('@discordjs/builders');
const testSchema = require('../../Schemas.js/test');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dbtest')
        .setDescription('db test'),
    async execute(interaction) {
        try {
            const data = await testSchema.findOne({
                GuildID: interaction.guild.id,
                UserID: interaction.user.id
            });

            if (!data) {
                await testSchema.create({
                    GuildID: interaction.guild.id,
                    UserID: interaction.user.id
                });
            } else {

                const user = data.UserID;
                const guild = data.GuildID;

                console.log({ user, guild });
            }
        } catch (error) {
            console.error(error);
        }
    }
};
