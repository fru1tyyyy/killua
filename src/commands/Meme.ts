import { Message } from "discord.js";
import axios from "axios";

export const meme = {
    name: "meme",
    async execute(message: Message) {
        try {
            const res = await axios.get("https://meme-api.com/gimme");
            message.reply(res.data.url);
        } catch {
            message.reply("Error fetching meme.");
        }
    }
};
