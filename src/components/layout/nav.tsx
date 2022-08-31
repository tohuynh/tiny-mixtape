import {
  HomeIcon,
  MusicalNoteIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode } from "react";

type NavItemProps = {
  label: string;
  icon: ReactNode;
  isCurrent: boolean;
  href: string;
};
function NavItem({ label, icon, isCurrent, href }: NavItemProps) {
  return (
    <li>
      <Link href={href}>
        <a className="flex flex-col items-center">
          <div
            className={`${
              isCurrent && "bg-gray-200"
            } flex h-8 w-14 items-center justify-center rounded-full`}
          >
            {icon}
          </div>
          <div className="text-base font-medium">{label}</div>
        </a>
      </Link>
    </li>
  );
}

const NAVS = [
  {
    href: "/",
    label: "Home",
    icon: <HomeIcon className=" h-5 w-5" />,
  },
  {
    href: "/playlists",
    label: "Discover",
    icon: <MusicalNoteIcon className=" h-5 w-5" />,
  },
  {
    href: "/create-playlist",
    label: "Create",
    icon: <PlusIcon className=" h-5 w-5" />,
  },
];

export default function Nav() {
  const { pathname } = useRouter();
  console.log(pathname);
  return (
    <nav className="fixed bottom-0 flex h-16 w-full flex-row items-center justify-center bg-zinc-50 md:h-full md:w-36 md:flex-col md:border-t-0">
      <ul className="flex w-full flex-row items-center justify-evenly gap-10 md:w-auto md:flex-col">
        {NAVS.map((nav) => (
          <NavItem key={nav.href} {...nav} isCurrent={pathname === nav.href} />
        ))}
      </ul>
    </nav>
  );
}
