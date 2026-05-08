'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Film, Tv, Check, Save, Loader2, LogOut, Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useLogout, useUpdateNotifications, useMe } from '@/hooks/use-auth';
import toast from 'react-hot-toast';
import type { UserPreferences } from '@/types';

const GENRES = [
  { id: 28, name: 'Acción', emoji: '💥' },
  { id: 12, name: 'Aventura', emoji: '🗺️' },
  { id: 16, name: 'Animación', emoji: '🎨' },
  { id: 35, name: 'Comedia', emoji: '😂' },
  { id: 80, name: 'Crimen', emoji: '🕵️' },
  { id: 18, name: 'Drama', emoji: '🎭' },
  { id: 14, name: 'Fantasía', emoji: '🧙' },
  { id: 27, name: 'Terror', emoji: '👻' },
  { id: 9648, name: 'Misterio', emoji: '🔍' },
  { id: 10749, name: 'Romance', emoji: '💕' },
  { id: 878, name: 'Ciencia ficción', emoji: '🚀' },
  { id: 53, name: 'Thriller', emoji: '😰' },
  { id: 99, name: 'Documental', emoji: '📹' },
  { id: 10751, name: 'Familia', emoji: '👨‍👩‍👧' },
  { id: 36, name: 'Historia', emoji: '📜' },
  { id: 37, name: 'Western', emoji: '🤠' },
];

const RATINGS = [
  { value: 0, label: 'Cualquiera' },
  { value: 5, label: '5+ ⭐' },
  { value: 6, label: '6+ ⭐' },
  { value: 7, label: '7+ ⭐' },
  { value: 8, label: '8+ ⭐' },
];

export default function SettingsPage() {
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['movie', 'tv']);
  const [minRating, setMinRating] = useState(5);
  const queryClient = useQueryClient();
  const logout = useLogout();
  const { data: me } = useMe();
  const updateNotifications = useUpdateNotifications();

  const { data: prefs, isLoading } = useQuery<UserPreferences>({
    queryKey: ['preferences'],
    queryFn: () => api.get('/preferences/me'),
  });

  useEffect(() => {
    if (prefs) {
      setSelectedGenres(prefs.favoriteGenres || []);
      setSelectedTypes(prefs.preferredTypes || ['movie', 'tv']);
      setMinRating(prefs.minRating || 5);
    }
  }, [prefs]);

  const savePreferences = useMutation({
    mutationFn: () =>
      api.put('/preferences/me', {
        favoriteGenres: selectedGenres,
        preferredTypes: selectedTypes,
        minRating,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferences'] });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      toast.success('Preferencias guardadas');
    },
    onError: () => toast.error('Error al guardar preferencias'),
  });

  const toggleGenre = (id: number) => {
    setSelectedGenres((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
    );
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.length > 1 ? prev.filter((t) => t !== type) : prev
        : [...prev, type],
    );
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-black flex items-center gap-2">
          <Settings className="h-7 w-7 text-muted-foreground" />
          Ajustes
        </h1>
        <p className="text-muted-foreground mt-1">Personaliza tu experiencia en DuoWatch</p>
      </div>

      <div className="card-cinema p-6 space-y-6">
        <h2 className="text-xl font-bold">Preferencias de contenido</h2>

        <div>
          <Label className="text-sm font-semibold text-foreground mb-3 block">
            Tipo de contenido preferido
          </Label>
          <div className="flex gap-4">
            {[
              { id: 'movie', label: 'Películas', icon: Film, emoji: '🎬' },
              { id: 'tv', label: 'Series', icon: Tv, emoji: '📺' },
            ].map((type) => {
              const isSelected = selectedTypes.includes(type.id);
              return (
                <button
                  key={type.id}
                  onClick={() => toggleType(type.id)}
                  className={cn(
                    'flex items-center gap-2 px-5 py-3 rounded-xl border transition-all',
                    isSelected
                      ? 'border-violet-500 bg-violet-500/15 text-violet-300'
                      : 'border-white/8 text-muted-foreground hover:border-violet-500/40',
                  )}
                >
                  <span>{type.emoji}</span>
                  <span className="font-medium">{type.label}</span>
                  {isSelected && <Check className="h-4 w-4" />}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <Label className="text-sm font-semibold text-foreground mb-3 block">
            Puntuación mínima
          </Label>
          <div className="flex gap-2 flex-wrap">
            {RATINGS.map((r) => (
              <button
                key={r.value}
                onClick={() => setMinRating(r.value)}
                className={cn(
                  'px-4 py-2 rounded-xl border text-sm font-medium transition-all',
                  minRating === r.value
                    ? 'border-violet-500 bg-violet-500/15 text-violet-300'
                    : 'border-white/8 text-muted-foreground hover:border-violet-500/40',
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-semibold text-foreground mb-3 block">
            Géneros favoritos ({selectedGenres.length} seleccionados)
          </Label>
          {isLoading ? (
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {GENRES.map((genre) => {
                const isSelected = selectedGenres.includes(genre.id);
                return (
                  <button
                    key={genre.id}
                    onClick={() => toggleGenre(genre.id)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs transition-all',
                      isSelected
                        ? 'border-violet-500 bg-violet-500/15 text-violet-300'
                        : 'border-white/8 text-muted-foreground hover:border-violet-500/40 hover:bg-violet-500/5',
                    )}
                  >
                    <span className="text-xl">{genre.emoji}</span>
                    <span className="font-medium text-center leading-tight">{genre.name}</span>
                    {isSelected && <Check className="h-3 w-3 text-violet-400" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <Button
          onClick={() => savePreferences.mutate()}
          disabled={savePreferences.isPending}
          variant="gradient"
          className="gap-2"
        >
          {savePreferences.isPending ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</>
          ) : (
            <><Save className="h-4 w-4" /> Guardar preferencias</>
          )}
        </Button>
      </div>

      <div className="card-cinema p-6 space-y-4">
        <h2 className="text-xl font-bold">Notificaciones</h2>
        <div className="flex items-center justify-between p-4 glass rounded-xl border border-white/5">
          <div>
            <p className="font-medium">Notificaciones de matches por email</p>
            <p className="text-sm text-muted-foreground">Recibe un email cuando hagas match con un amigo</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateNotifications.mutate(!me?.emailNotifications)}
            disabled={updateNotifications.isPending || !me}
            className={me?.emailNotifications ? 'border-violet-500/40 text-violet-300' : 'border-white/10 text-muted-foreground'}
          >
            {me?.emailNotifications ? <Bell className="h-4 w-4 mr-1.5" /> : <BellOff className="h-4 w-4 mr-1.5" />}
            {me?.emailNotifications ? 'Activadas' : 'Desactivadas'}
          </Button>
        </div>
      </div>

      <div className="card-cinema p-6 space-y-4 border border-destructive/20">
        <h2 className="text-xl font-bold text-destructive/80">Zona peligrosa</h2>
        <div className="flex items-center justify-between p-4 glass rounded-xl border border-white/5">
          <div>
            <p className="font-medium">Cerrar sesión</p>
            <p className="text-sm text-muted-foreground">Salir de tu cuenta en este dispositivo</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="gap-1 border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            Salir
          </Button>
        </div>
      </div>
    </div>
  );
}
