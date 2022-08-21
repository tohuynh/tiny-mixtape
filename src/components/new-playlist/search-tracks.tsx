import { Dispatch, Fragment, useCallback, useState } from "react";
import { Combobox, Transition } from "@headlessui/react";
import { CheckIcon, SelectorIcon, SearchIcon } from "@heroicons/react/solid";
import debounce from "lodash.debounce";
import { trpc } from "../../utils/trpc";
import { TrackSeed } from "../../server/router/output-types";
import { UserAction, UserActionType } from "./new-playlist-state";

type Props = {
  selectedTracksNum: number;
  dispatchUserAction: Dispatch<UserAction>;
};
export default function SearchTracks({
  selectedTracksNum,
  dispatchUserAction,
}: Props) {
  const [selected, setSelected] = useState<TrackSeed | undefined>(undefined);
  const [query, setQuery] = useState("");
  const searchQuery = trpc.useQuery(
    ["spotify.search", { q: query, offset: 0, limit: 5 }],
    {
      refetchOnWindowFocus: false,
    }
  );

  const handleSearch = useCallback(
    debounce((q: string) => {
      setSelected(undefined);
      setQuery(q);
    }, 100),
    []
  );

  const onSelectTrack = (track: TrackSeed) => {
    dispatchUserAction({ type: UserActionType.SELECT_TRACK, payload: track });
    setSelected(track);
  };

  const { data } = searchQuery;

  return (
    <Combobox
      value={selected}
      onChange={onSelectTrack}
      disabled={selectedTracksNum === 5}
    >
      <div className="relative mx-auto w-full md:w-2/3 lg:w-1/2">
        <div className="relative cursor-default overflow-hidden rounded-md bg-white shadow-md">
          <Combobox.Input
            className="h-14 w-full py-2 px-10 lg:px-14 text-base lg:text-lg truncate disabled:cursor-not-allowed"
            displayValue={(track: TrackSeed) =>
              track ? `${track.name} • ${track.artists.join(", ")}` : ""
            }
            onChange={(e) => handleSearch(e.target.value)}
            title="Select up to 5 tracks to generate a mixtape"
            placeholder="Select up to 5 tracks to generate a mixtape"
          />
          <div className="absolute inset-y-0 left-0 flex items-center px-2">
            <SearchIcon
              className="h-5 w-5 lg:h-6 lg:w-6 text-gray-400"
              aria-hidden
            />
          </div>
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <SelectorIcon
              className="h-5 w-5 lg:h-6 lg:w-6 text-gray-400"
              aria-hidden
            />
          </Combobox.Button>
        </div>
        {data && data.length > 0 && (
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Combobox.Options className="z-10 absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 sm:text-sm lg:text-base shadow-lg">
              {data?.map((track) => (
                <Combobox.Option
                  key={track.id}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? "bg-gray-100" : "bg-white"
                    }`
                  }
                  value={track}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? "font-medium" : "font-normal"
                        }`}
                      >
                        {`${track.name} • ${track.artists.join(", ")}`}
                      </span>
                      {selected && (
                        <span
                          className={`absolute inset-y-0 left-0 flex items-center pl-3 spotify-green`}
                        >
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          </Transition>
        )}
      </div>
    </Combobox>
  );
}
