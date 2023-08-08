const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, MessageManager, Embed, Collection, Events, Partials, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require(`discord.js`);
const fs = require('fs');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions], partials: [Partials.Message, Partials.Channel, Partials.Reaction] });
const reactions = require('./Schemas.js/reactionjs');
const ticketSchema = require("./Schemas.js/ticketSchema");

client.commands = new Collection();

require('dotenv').config();

const functions = fs.readdirSync("./src/functions").filter(file => file.endsWith(".js"));
const eventFiles = fs.readdirSync("./src/events").filter(file => file.endsWith(".js"));
const commandFolders = fs.readdirSync("./src/commands");

(async () => {
    for (file of functions) {
        require(`./functions/${file}`)(client);
    }
    client.handleEvents(eventFiles, "./src/events");
    client.handleCommands(commandFolders, "./src/commands");
    client.login(process.env.token)
})();

client.on(Events.MessageReactionAdd, async (reaction, user) => {
    let a = 3;
    if (!reaction.message.guildId) return;
    if (user.bot) return

    let cID = `<:${reaction.emoji.name}:${reaction.emoji.id}>`;
    if (!reaction.emoji.id) cID = reaction.emoji.name;

    const data = await reactions.findOne({ Guild: reaction.message.guildId, Message: reaction.message.id, Emoji: cID });

    if (!data) return;

    const guild = await client.guilds.cache.get(reaction.message.guildId);
    const member = await guild.members.cache.get(user.id)

    try {
        await member.roles.add(data.Role);
    } catch (e) {
        return;
    }
});


client.on(Events.MessageReactionRemove, async (reaction, user) => {
    if (!reaction.message.guildId) return;
    if (user.bot) return

    let cID = `<:${reaction.emoji.name}:${reaction.emoji.id}>`;
    if (!reaction.emoji.id) cID = reaction.emoji.name;

    const data = await reactions.findOne({ Guild: reaction.message.guildId, Message: reaction.message.id, Emoji: cID });

    if (!data) return;

    const guild = await client.guilds.cache.get(reaction.message.guildId);
    const member = await guild.members.cache.get(user.id)

    try {
        await member.roles.remove(data.Role);
    } catch (e) {
        return;
    }
});


//ticket system
client.on(Events.InteractionCreate, async interaction => {

    if (interaction.isButton()) return;
    if (interaction.isChatInputCommand()) return;

    const modal = new ModalBuilder()
        .setTitle("Provide us with more information.")
        .setCustomId("modal")

    const email = new TextInputBuilder()
        .setCustomId("email")
        .setRequired(true)
        .setLabel("Provide us with your email.")
        .setPlaceholder("You must enter a valid email")
        .setStyle(TextInputStyle.Short)

    const username = new TextInputBuilder()
        .setCustomId("username")
        .setRequired(true)
        .setLabel("Provide us with your username please.")
        .setPlaceholder("Username")
        .setStyle(TextInputStyle.Short)

    const reason = new TextInputBuilder()
        .setCustomId("reason")
        .setRequired(true)
        .setLabel("The reason for this ticket?")
        .setPlaceholder("Give us a reason for opening this ticket")
        .setStyle(TextInputStyle.Short)

    const firstActionRow = new ActionRowBuilder().addComponents(email)
    const secondActionRow = new ActionRowBuilder().addComponents(username)
    const thirdActionRow = new ActionRowBuilder().addComponents(reason)

    modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

    let choices;
    if (interaction.isSelectMenu()) {

        choices = interaction.values;

        const result = choices.join("");

        ticketSchema.findOne({ Guild: interaction.guild.id }, async (err, data) => {

            const filter = { Guild: interaction.guild.id };
            const update = { Ticket: result };

            ticketSchema.updateOne(filter, update, {
                new: true
            }).then(value => {
                console.log(value)
            })
        })
    }

    if (!interaction.isModalSubmit()) {
        interaction.showModal(modal)
    }
})

client.on(Events.InteractionCreate, async interaction => {

    if (interaction.isModalSubmit()) {

        if (interaction.customId == "modal") {

            ticketSchema.findOne({ Guild: interaction.guild.id }, async (err, data) => {

                const emailInput = interaction.fields.getTextInputValue("email")
                const usernameInput = interaction.fields.getTextInputValue("username")
                const reasonInput = interaction.fields.getTextInputValue("reason")

                const posChannel = await interaction.guild.channels.cache.find(c => c.name === `ticket-${interaction.user.id}`);
                if (posChannel) return await interaction.reply({ content: `You already have a ticket open - ${posChannel}`, ephemeral: true });

                const category = data.Channel;

                const embed = new EmbedBuilder()
                    .setColor("Blue")
                    .setTitle(`${interaction.user.id}'s Ticket`)
                    .setDescription("Welcome to your ticket! Please wait while the staff team review the details.")
                    .addFields({ name: `Email`, value: `${emailInput}` })
                    .addFields({ name: `Username`, value: `${usernameInput}` })
                    .addFields({ name: `Reason`, value: `${reasonInput}` })
                    .addFields({ name: `Type`, value: `${data.Ticket}` })
                    .setFooter({ text: `${interaction.guild.name}'s tickets.` })

                const button = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("ticket")
                            .setLabel("🗑️ Close Ticket")
                            .setStyle(ButtonStyle.Danger)
                    )

                let channel = await interaction.guild.channels.create({
                    name: `ticket-${interaction.user.id}`,
                    type: ChannelType.GuildText,
                    parent: `${category}`
                })

                let msg = await channel.send({ embeds: [embed], components: [button] });
                await interaction.reply({ content: `Your ticket is now open inside of ${channel}.`, ephemeral: true });

                const collector = msg.createMessageComponentCollector()

                collector.on("collect", async i => {
                    await channel.delete();

                    const dmEmbed = new EmbedBuilder()
                        .setColor("Blue")
                        .setTitle("Your ticket has been closed")
                        .setDescription("Thanks for contacting us! If you need anything else just feel free to open up another ticket!")
                        .setTimestamp()

                    await interaction.member.send({ embeds: [dmEmbed] }).catch(err => {
                        return;
                    })
                })
            })
        }
    }
})