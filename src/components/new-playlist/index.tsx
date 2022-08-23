import { useReducer, useState } from "react";
import { trpc } from "../../utils/trpc";
import { PlusIcon } from "@heroicons/react/outline";
import SearchTracks from "./search-tracks";
import Playlist from "./playlist";
import { AudioFeatures } from "../../server/router/output-types";
import TrackChips from "./track-chips";
import { calculateAverageAudioFeatures } from "../../utils/audio-features";
import CreatePlaylistDialog from "./create-playlist-dialog";
import ModifyPlaylist from "./modify-playlist";
import {
  INITIAL_AUDIO_FEATURES,
  UserActionType,
  userInputReducer,
} from "./new-playlist-state";
import Spinner from "./spinner";

export default function NewPlaylist() {
  const [userInput, dispatchUserAction] = useReducer(userInputReducer, {
    trackSeeds: [],
    audioFeatures: { ...INITIAL_AUDIO_FEATURES },
    playlistTracks: [],
    hasNewTrackSeeds: true,
  });
  const [audioFeaturesForDisplay, setAudioFeaturesForDisplay] = useState<
    Partial<AudioFeatures>
  >({
    ...INITIAL_AUDIO_FEATURES,
  });

  const getRecommendationsQuery = trpc.useQuery(
    [
      "spotify.getRecommendations",
      {
        ...userInput.audioFeatures,
        trackSeeds: userInput.trackSeeds.map((track) => track.id),
        limit: 20,
      },
    ],
    {
      refetchOnWindowFocus: false,
      onSuccess: (result) => {
        dispatchUserAction({
          type: UserActionType.UPDATE_PLAYLIST,
          payload: [...result],
        });
        if (result.length > 0 && userInput.hasNewTrackSeeds) {
          setAudioFeaturesForDisplay(calculateAverageAudioFeatures(result));
        }
      },
    }
  );

  const { status } = getRecommendationsQuery;
  const isLoading = status === "loading";
  const hasTrackSeeds = userInput.trackSeeds.length > 0;

  const [createPlaylistDialogIsOpen, setCreatePlaylistDialogIsOpen] =
    useState(false);

  return (
    <div className="pb-24 lg:flex lg:flex-row lg:justify-start lg:gap-x-4">
      <CreatePlaylistDialog
        isOpen={createPlaylistDialogIsOpen}
        setIsOpen={setCreatePlaylistDialogIsOpen}
        uris={userInput.playlistTracks.map((track) => track.uri)}
      />
      <div className="flex items-start justify-center lg:basis-36 lg:pt-16">
        <button
          className="fixed bottom-0 right-0 z-50 m-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-spotify-green shadow-lg disabled:cursor-not-allowed lg:sticky lg:top-4 lg:m-0"
          aria-label="New mixtape"
          onClick={() => setCreatePlaylistDialogIsOpen(true)}
          disabled={
            getRecommendationsQuery.status === "error" ||
            getRecommendationsQuery.status === "loading" ||
            userInput.playlistTracks.length === 0
          }
        >
          <PlusIcon className="h-6 w-6" aria-hidden />
        </button>
      </div>
      <div className="px-4 lg:flex-1 lg:px-0">
        <div className="flex flex-col gap-y-4 border-b-2 py-16">
          <SearchTracks
            placeholderText="Select up to 5 tracks to generate a mixtape"
            disabled={userInput.trackSeeds.length === 5}
            onSelectUserActionType={UserActionType.SELECT_TRACK}
            dispatchUserAction={dispatchUserAction}
          />
          <TrackChips
            dispatchUserAction={dispatchUserAction}
            tracks={userInput.trackSeeds}
          />
        </div>
        {hasTrackSeeds && (
          <div className="flex flex-col gap-y-4 py-16">
            <ModifyPlaylist
              audioFeaturesForDisplay={audioFeaturesForDisplay}
              setAudioFeaturesForDisplay={setAudioFeaturesForDisplay}
              dispatchUserAction={dispatchUserAction}
            />
            <SearchTracks
              placeholderText="Add track to mixtape"
              disabled={false}
              onSelectUserActionType={UserActionType.ADD_TRACK}
              dispatchUserAction={dispatchUserAction}
            />
          </div>
        )}
        {isLoading && hasTrackSeeds ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <Playlist
            draggablePlaylistTracks={
              hasTrackSeeds ? userInput.playlistTracks : []
            }
            dispatchUserAction={dispatchUserAction}
          />
        )}
      </div>
    </div>
  );
}
