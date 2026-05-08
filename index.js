const {
  Client,
  GatewayIntentBits
} = require('discord.js');

const fetch = require('node-fetch');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const TOKEN = process.env.TOKEN;
const API_URL = process.env.API_URL;

client.on('interactionCreate', async (interaction) => {

  // ✅ AUTOCOMPLETE
  if (interaction.isAutocomplete()) {
    let focusedValue = interaction.options.getFocused();

    if (!focusedValue || typeof focusedValue !== "string") {
      focusedValue = "";
    }

    focusedValue = focusedValue.toLowerCase();

    try {
      // Do not call API if user has not typed anything
      if (!focusedValue.trim()) {
        return await interaction.respond([]);
      }

      const res = await fetch(
        `${API_URL}?q=${encodeURIComponent(focusedValue)}`
      );

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Autocomplete did not return JSON:", text);
        return await interaction.respond([]);
      }

      if (!Array.isArray(data)) {
        console.error("Autocomplete returned non-array:", data);
        return await interaction.respond([]);
      }

      const choices = data
        .map(item => item.item)
        .filter(Boolean)
        .slice(0, 25);

      return await interaction.respond(
        choices.map(choice => ({
          name: String(choice).slice(0, 100),
          value: String(choice).slice(0, 100)
        }))
      );

    } catch (err) {
      console.error("Autocomplete error:", err);

      try {
        return await interaction.respond([]);
      } catch {}
    }
  }

  // ✅ SLASH COMMAND
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'p') {
    const item = interaction.options.getString('item');

    try {
      await interaction.deferReply();

      const res = await fetch(
        `${API_URL}?item=${encodeURIComponent(item)}`
      );

      const data = await res.json();

      if (data.error) {
        return await interaction.editReply({
          content: "Item not found"
        });
      }

      return await interaction.editReply(
        `${data.item} price range is ${data.min} - ${data.max} (last updated: ${data.lastUpdate})`
      );

    } catch (err) {
      console.error("Slash command error:", err);

      try {
        if (interaction.deferred || interaction.replied) {
          return await interaction.editReply({
            content: "Error contacting API"
          });
        }

        return await interaction.reply({
          content: "Error contacting API",
          ephemeral: true
        });
      } catch {}
    }
  }
});

client.login(TOKEN);
