require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const characters = require("./characters.json");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

function getRandomCharacter(faction = null, exclude = null) {
  let pool = characters;

  if (faction) {
    pool = pool.filter(c => c.faction === faction);
  }

  if (exclude) {
    pool = pool.filter(c => c.name !== exclude);
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

client.once("ready", async () => {
  console.log(`✅ Bot online as ${client.user.tag}`);

  const command = new SlashCommandBuilder()
    .setName("randomize")
    .setDescription("Randomize an Identity V character")
    .addStringOption(option =>
      option
        .setName("faction")
        .setDescription("Survivor or Hunter")
        .addChoices(
          { name: "Survivor", value: "Survivor" },
          { name: "Hunter", value: "Hunter" }
        )
    );

  // THIS LINE IS THE IMPORTANT FIX
  await client.application.commands.set([command]);

  console.log("✅ Slash command registered");
});

client.on("interactionCreate", async interaction => {

  if (interaction.isChatInputCommand()) {

    if (interaction.commandName === "randomize") {

      const faction = interaction.options.getString("faction");
      const char = getRandomCharacter(faction);

      const embed = new EmbedBuilder()
        .setTitle(char.name)
        .setDescription(`Faction: **${char.faction}**`)
        .setImage(char.image)
        .setColor(char.faction === "Survivor" ? 0x4caf50 : 0xf44336);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`reroll_${char.name}_${char.faction}`)
          .setLabel("🔁 Replace")
          .setStyle(ButtonStyle.Secondary)
      );

      await interaction.reply({
        embeds: [embed],
        components: [row]
      });

    }

  }

  if (interaction.isButton()) {

    if (interaction.customId.startsWith("reroll_")) {

      const [, oldName, faction] = interaction.customId.split("_");
      const newChar = getRandomCharacter(faction, oldName);

      const embed = new EmbedBuilder()
        .setTitle(newChar.name)
        .setDescription(`Faction: **${newChar.faction}**`)
        .setImage(newChar.image)
        .setColor(newChar.faction === "Survivor" ? 0x4caf50 : 0xf44336);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`reroll_${newChar.name}_${newChar.faction}`)
          .setLabel("🔁 Replace")
          .setStyle(ButtonStyle.Secondary)
      );

      await interaction.update({
        embeds: [embed],
        components: [row]
      });

    }

  }

});

client.login(process.env.TOKEN);