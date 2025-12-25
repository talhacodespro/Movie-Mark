'use client';

import { cn } from '@/lib/utils';
import { CircleUserRound, Clapperboard, Tv } from 'lucide-react';
import {
  IconDeviceTv,
  IconDeviceTvFilled,
  IconDeviceTvOld,
  IconDeviceTvOldFilled,
  IconUser,
  IconUserFilled,
} from '@tabler/icons-react';

import { Link } from 'next-view-transitions';
import { usePathname } from 'next/navigation';

const clickSound =
  typeof Audio !== 'undefined' ? new Audio('/sounds/click.mp3') : null;

const menuList = [
  {
    title: 'Movie',
    icon: IconDeviceTv,
    activeIcon: IconDeviceTvFilled,
    href: '/movie',
  },
  {
    title: 'Series',
    icon: IconDeviceTvOld,
    activeIcon: IconDeviceTvOldFilled,
    href: '/series',
  },
  {
    title: 'Profile',
    icon: IconUser,
    activeIcon: IconUserFilled,
    href: '/profile',
  },
];

const BottomNavigation = () => {
  const pathname = usePathname();

  const handleClick = () => {
    clickSound?.play().catch(() => {});
  };

  return (
    <ul className="fixed bottom-0 left-0 right-0 mx-auto flex w-full max-w-md justify-evenly bg-muted py-2 rounded-t-lg">
      {menuList.map((item, index) => {
        const isActive = pathname === item.href;

        return (
          <li key={index}>
            <Link
              href={item.href}
              onClick={handleClick}
              className={cn(
                'flex flex-col gap-y-1 items-center text-neutral-500',
                isActive && 'text-black dark:text-white'
              )}>
              {isActive ? <item.activeIcon /> : <item.icon />}
              {item.title}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default BottomNavigation;
