'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { User, Edit3, Save, X, Film, Tv, Heart, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth.store';
import { useMe } from '@/hooks/use-auth';
import { useLikedMovies } from '@/hooks/use-movies';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getAvatarUrl, formatDate, getPosterUrl } from '@/lib/utils';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const { data: fullUser, isLoading } = useMe();
  const { data: likedMovies } = useLikedMovies();
  const [editing, setEditing] = useState(false);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      displayName: user?.displayName || '',
      bio: user?.bio || '',
      avatarUrl: user?.avatarUrl || '',
    },
  });

  const updateProfile = useMutation({
    mutationFn: (data: any) => api.patch('/users/me', data),
    onSuccess: (data: any) => {
      updateUser(data);
      queryClient.setQueryData(['me'], data);
      toast.success('Perfil actualizado');
      setEditing(false);
    },
    onError: () => toast.error('Error al actualizar el perfil'),
  });

  const displayedUser = fullUser || user;

  if (isLoading && !user) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-40 rounded-3xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="card-cinema p-6">
        <div className="flex items-start justify-between mb-6">
          <h1 className="text-2xl font-black flex items-center gap-2">
            <User className="h-6 w-6 text-violet-400" />
            Mi Perfil
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (editing) {
                reset();
              }
              setEditing(!editing);
            }}
            className="gap-1"
          >
            {editing ? (
              <><X className="h-4 w-4" /> Cancelar</>
            ) : (
              <><Edit3 className="h-4 w-4" /> Editar</>
            )}
          </Button>
        </div>

        <div className="flex items-start gap-6">
          <Avatar className="h-20 w-20 border-2 border-violet-500/30 shrink-0">
            <AvatarImage src={displayedUser ? getAvatarUrl(displayedUser) : ''} />
            <AvatarFallback className="text-xl">
              {(displayedUser?.displayName || displayedUser?.username || '?')[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            {editing ? (
              <form onSubmit={handleSubmit((data) => updateProfile.mutate(data))} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Nombre visible</Label>
                  <Input placeholder="Tu nombre" {...register('displayName')} />
                </div>
                <div className="space-y-1.5">
                  <Label>Bio <span className="text-muted-foreground text-xs">(160 chars)</span></Label>
                  <Input placeholder="Cuéntanos algo sobre ti..." {...register('bio')} maxLength={160} />
                </div>
                <div className="space-y-1.5">
                  <Label>URL de avatar</Label>
                  <Input placeholder="https://..." type="url" {...register('avatarUrl')} />
                </div>
                <Button type="submit" size="sm" disabled={updateProfile.isPending} className="gap-1">
                  {updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Guardar cambios
                </Button>
              </form>
            ) : (
              <>
                <h2 className="text-xl font-bold">
                  {displayedUser?.displayName || displayedUser?.username}
                </h2>
                <p className="text-muted-foreground text-sm">@{displayedUser?.username}</p>
                {displayedUser?.bio && (
                  <p className="text-sm mt-2 text-foreground/80">{displayedUser.bio}</p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Miembro desde {displayedUser?.createdAt ? formatDate(displayedUser.createdAt) : ''}
                </p>
              </>
            )}
          </div>
        </div>

        {!editing && fullUser?.stats && (
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/5">
            <div className="text-center">
              <p className="text-2xl font-black text-gradient">{fullUser.stats.friends}</p>
              <p className="text-xs text-muted-foreground">Amigos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-violet-400">{fullUser.stats.liked}</p>
              <p className="text-xs text-muted-foreground">Likes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-fuchsia-400">{fullUser.stats.matches}</p>
              <p className="text-xs text-muted-foreground">Matches</p>
            </div>
          </div>
        )}
      </div>

      {likedMovies && likedMovies.length > 0 && (
        <div className="card-cinema p-6">
          <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
            <Heart className="h-5 w-5 text-rose-400 fill-rose-400" />
            Mis likes ({likedMovies.length})
          </h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {likedMovies.slice(0, 12).map((movie) => {
              const posterUrl = getPosterUrl(movie.posterPath, 'w185');
              return (
                <div key={movie.id} className="poster-card relative aspect-[2/3] rounded-lg overflow-hidden">
                  {posterUrl ? (
                    <Image src={posterUrl} alt={movie.title} fill className="object-cover" sizes="100px" />
                  ) : (
                    <div className="h-full bg-cinema-800 flex items-center justify-center">
                      {movie.mediaType === 'MOVIE' ? (
                        <Film className="h-5 w-5 text-muted-foreground/30" />
                      ) : (
                        <Tv className="h-5 w-5 text-muted-foreground/30" />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {likedMovies.length > 12 && (
              <div className="aspect-[2/3] rounded-lg bg-cinema-800 flex items-center justify-center">
                <span className="text-sm font-bold text-muted-foreground">+{likedMovies.length - 12}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
