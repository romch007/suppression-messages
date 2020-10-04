const prompts = require("prompts");
const Discord = require("discord.js");
const client = new Discord.Client();

const fetchAll = async (channel) => {
  const allMessages = [];
  let moreToFetch = true;
  let lastId;
  while (moreToFetch) {
    const options = { limit: 100 };
    if (lastId) {
      options.before = lastId;
    }
    const messages = await channel.fetchMessages(options);
    allMessages.push(...messages.array());
    if (messages.array().length == 0) break;
    lastId = messages.last().id;
    if (messages.array().length > 100) {
      moreToFetch = false;
    }
  }
  return allMessages;
};

(async () => {
  const response = await prompts({
    type: "text",
    name: "token",
    message: "Token discord",
  });
  await client.login(response.token).catch(() => {
    console.error("Impossible de se connecter. Veuillez vérifier le token.");
    process.exit(1);
  });
  const clientId = client.user.id;
  const channels = client.channels.filter((channel) => channel.type === "dm");
  const result = await prompts({
    type: "multiselect",
    name: "channels",
    message: "Discussions à nettoyer",
    choices: channels.map((channel) => ({
      title: channel.recipient.username,
      value: channel,
    })),
  });
  await Promise.all(
    result.channels.map(async (channel) => {
      const name = channel.recipient.username;
      console.log(`Suppression messages de ${name} en cours...`);
      const messages = (await fetchAll(channel)).filter(
        (message) => message.author.id === clientId
      );
      const l = messages.length;
      await Promise.all(
        messages.map(async (message) => {
          await message.delete();
        })
      );
      console.log(`${l} message(s) supprimé(s) de ${name}`);
    })
  );
  console.log("Fini! :)");
  client.destroy();
})();
