import { Message } from "discord.js";

export const hello = {
    name: "hello",
    execute(message: Message) {
        message.reply("How's your day?");
    }
};

export const noob = {
    name: "noob",
    execute(message: Message) {
        message.reply("Git gud");
    }
};

export const minecraft = {
    name: "minecraft",
    execute(message: Message) {
        const responses = [
            "FLINT AND STEEL",
            "THIS IS A CRAFTING TABLE",
            "THE NETHER",
            "WATER BUCKET RELEASE",
            "AN ENDER PEARL",
            "I... AM STEVE",
            "CHICKEN JOCKEY",
            "AS A CHILD, I YEARNED FOR THE MINES"
        ];
        const random = responses[Math.floor(Math.random() * responses.length)];
        message.reply(random);
    }
};

export const rps = {
    name: "rps",
    execute(message: Message, args: string[] = []) {
        const user = args[0]?.toLowerCase();
        const choices = ["rock", "paper", "scissors"];

        if (!choices.includes(user!)) {
            message.reply("Choose rock, paper, or scissors. Example: $rps rock");
            return;
        }

        const botChoice = choices[Math.floor(Math.random() * 3)];
        let result = "";

        if (user === botChoice) result = "It's a tie!";
        else if (
            (user === "rock" && botChoice === "scissors") ||
            (user === "scissors" && botChoice === "paper") ||
            (user === "paper" && botChoice === "rock")
        ) result = "You win!";
        else result = "You lose!";

        message.reply(`I chose **${botChoice}**.\n${result}`);
    }
};
