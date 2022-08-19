import { ArrayElement } from "../../types/utility-types";
import { inferQueryOutput } from "../../utils/trpc";

export type TrackSeed = ArrayElement<inferQueryOutput<"spotify.search">>;

export type PlaylistTrack = ArrayElement<
  inferQueryOutput<"spotify.getRecommendations">
>;