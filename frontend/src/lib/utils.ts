import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatRelativeDate(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'ahora mismo';
  if (diffMins < 60) return `hace ${diffMins}m`;
  if (diffHours < 24) return `hace ${diffHours}h`;
  if (diffDays < 7) return `hace ${diffDays}d`;
  return formatDate(date);
}

export function getPosterUrl(path: string | null | undefined, size = 'w500'): string | null {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function getBackdropUrl(path: string | null | undefined, size = 'w1280'): string | null {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function getAvatarUrl(user: { avatarUrl?: string | null; username: string; displayName?: string | null }): string {
  if (user.avatarUrl) return user.avatarUrl;
  const name = encodeURIComponent(user.displayName || user.username);
  return `https://ui-avatars.com/api/?name=${name}&background=7c3aed&color=fff&size=128&bold=true`;
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export function getRatingColor(rating: number): string {
  if (rating >= 7.5) return 'text-emerald-400';
  if (rating >= 6) return 'text-amber-400';
  return 'text-red-400';
}

export function getScoreColor(score: number): string {
  if (score >= 70) return 'text-emerald-400';
  if (score >= 50) return 'text-amber-400';
  return 'text-red-400';
}
