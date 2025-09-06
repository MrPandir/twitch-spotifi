import { searchTrack } from "@api/spotify";
import { notification, reply } from "@bot/responses";
import { Track } from "@entities";
import { queue } from "@services/queue";
import { getTracksFromLinks } from "@services/url-handlers";
import { applyLimits, checkLimits } from "@services/limits";
import type { CommandExecutor } from "../types";

// TODO: Add a check if the track is already in the queue.
// BUG: Unavailable track says it's being added, but it's not happening.

const executor: CommandExecutor = async function (client, author, args, tags) {
  if (!args.length) {
    return reply("sr", "noArgs");
  }

  // Link processing and adding

  const result = await getTracksFromLinks(args);

  if (result.detected) {
    const { tracksToAdd, tracksRejected, limit } = applyLimits(
      author.id,
      result.tracks,
    );

    const key = limit.reached === "queue" ? "queueLimit" : "userLimit";
    const limitReply = reply("sr", key, limit);

    if (tracksToAdd.length === 0) {
      return limitReply;
    }

    const addedTracks = queue.addTracks(author.id, tracksToAdd);

    if (addedTracks.length === 1) {
      const track = addedTracks[0];

      const response = [
        notification("sr", "userAddedTrack", author, track),
        reply("sr", "addedTrack", track),
      ];

      if (tracksRejected.length) {
        response.push(limitReply);
      }

      return response;
    }

    if (addedTracks.length === 0) {
      if (result.length === 1) return reply("sr", "trackNotFound");
      return reply("sr", "tracksNotFound");
    }

    const response = [
      notification("sr", "userAddedTracks", author, addedTracks.length),
      reply("sr", "addedTracks", addedTracks.length),
    ];

    if (tracksRejected.length) {
      response.push(limitReply);
    }

    return response;
  }

  // Search and add by track name

  const limit = checkLimits(author.id);
  if (!limit.canBeAdded) {
    const key = limit.reached === "queue" ? "queueLimit" : "userLimit";
    return reply("sr", key, limit);
  }

  const searchQuery = args.join(" ");
  const track = await searchTrack(searchQuery);

  if (!track || !track.name) {
    console.log(`Track not found with query: "${searchQuery}"`);
    return reply("sr", "trackNotFound");
  }

  console.info(`Track found: ${track.name} by ${track.artists[0].name}`);

  const addedTrack = queue.addTrack(author.id, Track.fromSpotifyTrack(track));

  return [
    notification("sr", "userAddedTrack", author, addedTrack),
    reply("sr", "addedTrack", addedTrack),
  ];
};

export default executor;
