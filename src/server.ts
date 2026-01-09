import { Client, GatewayIntentBits, Collection, Message } from "discord.js";
import { config } from "./config.ts";
import * as funCommands from "./commands/Fun.ts";
import * as memeCommands from "./commands/Meme.ts";
import * as musicCommands from "./commands/Music.ts";

interface Command {
  name: string;
  execute: (message: Message, args?: string[]) => void | Promise<void>;
}

interface CustomClient extends Client {
  commands: Collection<string, Command>;
}

const client: CustomClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
}) as CustomClient;

client.commands = new Collection();

function registerCommands(module: any) {
  Object.values(module).forEach((cmd: any) => {
    if (cmd?.name && typeof cmd.execute === "function") {
      client.commands.set(cmd.name, cmd);
      console.log(`Registered command: ${cmd.name}`);
    }
  });
}

registerCommands(funCommands);
registerCommands(memeCommands);
registerCommands(musicCommands);

client.once("ready", () => {
  console.log(`Logged in as ${client.user?.tag}`);
});

client.on("messageCreate", async (message: Message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(config.prefix)) return;

  const args = message.content
    .slice(config.prefix.length)
    .trim()
    .split(/\s+/);

  const cmdName = args.shift()?.toLowerCase();
  if (!cmdName) return;

  const command = client.commands.get(cmdName);
  if (!command) return;

  try {
    await command.execute(message, args);
  } catch (err) {
    console.error(err);
    message.reply("❌ Error executing command.");
  }
});

client.login(config.token);
