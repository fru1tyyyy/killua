import { Message } from "discord.js";
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  getVoiceConnection,
  VoiceConnection,
  StreamType
} from "@discordjs/voice";
import play from "play-dl";
import ytdl from "@distube/ytdl-core";
import spotify from "spotify-url-info";

const { getData } = spotify;

interface QueueItem {
  title: string;
  url: string;
}

const queue: QueueItem[] = [];
const player = createAudioPlayer();
let isPlaying = false;

export const join = {
  name: "join",
  execute(message: Message) {
    const channel = message.member?.voice.channel;
    if (!channel) return message.reply("Join a voice channel first.");

    joinVoiceChannel({
      channelId: channel.id,
      guildId: message.guild!.id,
      adapterCreator: message.guild!.voiceAdapterCreator
    });

    message.reply("Joined voice channel.");
  }
};

export const leave = {
  name: "leave",
  execute(message: Message) {
    const conn = getVoiceConnection(message.guild!.id);
    if (!conn) return message.reply("I'm not in a voice channel.");

    conn.destroy();
    queue.length = 0;
    isPlaying = false;

    message.reply("Left the channel.");
  }
};

export const playCommand = {
  name: "play",
  async execute(message: Message, args: string[] = []) {
    const query = args.join(" ");
    if (!query) return message.reply("Provide a song name.");

    const channel = message.member?.voice.channel;
    if (!channel) return message.reply("Join a voice channel first.");

    const conn = joinVoiceChannel({
      channelId: channel.id,
      guildId: message.guild!.id,
      adapterCreator: message.guild!.voiceAdapterCreator
    });

    let title = "";
    let url = "";

    try {
      if (query.includes("spotify.com")) {
        const info = await getData(query);
        title = `${info.name} - ${info.artists.map((a: any) => a.name).join(", ")}`;

        const res = await play.search(
          `${info.name} ${info.artists.map((a: any) => a.name).join(" ")}`,
          { limit: 1 }
        );

        if (!res[0]?.id) return message.reply("No YouTube result found.");
        url = `https://www.youtube.com/watch?v=${res[0].id}`;
      } else {
        const res = await play.search(query, { limit: 1 });
        if (!res[0]?.id) return message.reply("No video found.");

        title = res[0].title ?? "Unknown title";
        url = `https://www.youtube.com/watch?v=${res[0].id}`;
      }
    } catch (err) {
      console.error(err);
      return message.reply("Search failed.");
    }

    console.log("QUEUE ADD:", title, url);

    queue.push({ title, url });
    message.reply(`🎵 Added: **${title}**`);

    if (!isPlaying) playNext(message, conn);
  }
};

async function playNext(message: Message, conn: VoiceConnection) {
  if (queue.length === 0) {
    isPlaying = false;
    return message.reply("📭 Queue empty.");
  }

  const next = queue.shift()!;
  isPlaying = true;

  message.reply(`▶️ Now playing: **${next.title}**`);

  try {
    const stream = ytdl(next.url, {
      filter: "audioonly",
      quality: "highestaudio",
      highWaterMark: 1 << 25
    });

    const resource = createAudioResource(stream, {
      inputType: StreamType.Arbitrary
    });

    player.play(resource);
    conn.subscribe(player);

    player.once(AudioPlayerStatus.Idle, () => {
      playNext(message, conn);
    });
  } catch (err) {
    console.error("PLAY ERROR:", err);
    playNext(message, conn);
  }
}

export const stop = {
  name: "stop",
  execute(message: Message) {
    queue.length = 0;
    player.stop();
    isPlaying = false;
    message.reply("Stopped.");
  }
};

export const skip = {
  name: "skip",
  execute(message: Message) {
    if (!isPlaying) return message.reply("Nothing playing.");
    player.stop();
    message.reply("Skipped.");
  }
};

export const pause = {
  name: "pause",
  execute(message: Message) {
    player.pause();
    message.reply("Paused.");
  }
};

export const resume = {
  name: "resume",
  execute(message: Message) {
    player.unpause();
    message.reply("Resumed.");
  }
};
