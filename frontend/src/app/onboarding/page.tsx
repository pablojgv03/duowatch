'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Tv, Check, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const MOVIE_GENRES = [
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

const STEPS = [
  { id: 'welcome', title: 'Bienvenido/a', subtitle: 'Vamos a personalizar tu experiencia' },
  { id: 'genres', title: 'Tus géneros favoritos', subtitle: 'Selecciona al menos 3' },
  { id: 'types', title: '¿Qué prefieres ver?', subtitle: 'Puedes elegir ambos' },
  { id: 'done', title: '¡Todo listo!', subtitle: 'Tu perfil está configurado' },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['movie', 'tv']);
  const { updateUser } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const savePreferences = useMutation({
    mutationFn: async () => {
      await api.put('/preferences/me', {
        favoriteGenres: selectedGenres,
        preferredTypes: selectedTypes,
        minRating: 5.0,
      });
      await api.post('/users/me/complete-onboarding');
    },
    onSuccess: () => {
      updateUser({ isOnboarded: true });
      queryClient.invalidateQueries({ queryKey: ['me'] });
      setStep(3);
    },
    onError: () => {
      toast.error('Error al guardar preferencias. Puedes configurarlas más tarde en ajustes.');
      router.push('/dashboard');
    },
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

  const canProceed = step === 1 ? selectedGenres.length >= 3 : true;

  return (
    <div className="min-h-screen bg-cinema-950 flex flex-col items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-600/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.slice(0, 3).map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={cn(
                  'h-2 w-2 rounded-full transition-all duration-300',
                  i <= step ? 'bg-violet-500 w-6' : 'bg-white/20',
                )}
              />
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="h-20 w-20 rounded-3xl bg-gradient-match flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-violet-900/50">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl font-black mb-4">
                ¡Hola! Vamos a <span className="text-gradient">configurar tu perfil</span>
              </h1>
              <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                En solo 2 pasos te ayudaremos a encontrar películas y series perfectas para ti y tus amigos.
              </p>
              <Button size="xl" variant="gradient" onClick={() => setStep(1)} className="gap-2">
                Empezar
                <ArrowRight className="h-5 w-5" />
              </Button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="genres"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black mb-2">¿Qué géneros te gustan?</h2>
                <p className="text-muted-foreground">
                  Selecciona al menos 3 géneros favoritos ({selectedGenres.length} seleccionados)
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                {MOVIE_GENRES.map((genre) => {
                  const isSelected = selectedGenres.includes(genre.id);
                  return (
                    <button
                      key={genre.id}
                      onClick={() => toggleGenre(genre.id)}
                      className={cn(
                        'relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-200',
                        isSelected
                          ? 'border-violet-500 bg-violet-500/15 text-violet-300'
                          : 'border-white/8 bg-white/3 text-muted-foreground hover:border-violet-500/40 hover:bg-violet-500/5',
                      )}
                    >
                      <span className="text-2xl">{genre.emoji}</span>
                      <span className="text-xs font-semibold text-center">{genre.name}</span>
                      {isSelected && (
                        <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-violet-500 flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(0)}>
                  Atrás
                </Button>
                <Button
                  variant="gradient"
                  onClick={() => setStep(2)}
                  disabled={!canProceed}
                  className="gap-2"
                >
                  Continuar
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="types"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-lg mx-auto"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black mb-2">¿Qué prefieres ver?</h2>
                <p className="text-muted-foreground">Puedes elegir ambas opciones</p>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                {[
                  { id: 'movie', label: 'Películas', icon: Film, emoji: '🎬', desc: 'Blockbusters, indie, clásicos...' },
                  { id: 'tv', label: 'Series', icon: Tv, emoji: '📺', desc: 'Netflix, HBO, Disney+...' },
                ].map((type) => {
                  const isSelected = selectedTypes.includes(type.id);
                  return (
                    <button
                      key={type.id}
                      onClick={() => toggleType(type.id)}
                      className={cn(
                        'flex flex-col items-center gap-3 p-8 rounded-2xl border transition-all duration-200',
                        isSelected
                          ? 'border-violet-500 bg-violet-500/15'
                          : 'border-white/8 bg-white/3 hover:border-violet-500/40',
                      )}
                    >
                      <span className="text-4xl">{type.emoji}</span>
                      <span className="font-bold text-lg">{type.label}</span>
                      <span className="text-xs text-muted-foreground">{type.desc}</span>
                      {isSelected && (
                        <div className="h-6 w-6 rounded-full bg-violet-500 flex items-center justify-center">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  Atrás
                </Button>
                <Button
                  variant="gradient"
                  onClick={() => savePreferences.mutate()}
                  disabled={savePreferences.isPending}
                  className="gap-2"
                >
                  {savePreferences.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      Finalizar
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                className="h-24 w-24 rounded-full bg-gradient-match flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-violet-900/50"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5 }}
              >
                <Check className="h-12 w-12 text-white" />
              </motion.div>
              <h2 className="text-4xl font-black mb-4">
                ¡<span className="text-gradient">Todo listo</span>!
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Tu perfil está configurado. Ahora ve a descubrir películas y hacer matches con tus amigos.
              </p>
              <Button
                size="xl"
                variant="gradient"
                onClick={() => router.push('/dashboard')}
                className="gap-2"
              >
                Ir al Dashboard
                <ArrowRight className="h-5 w-5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
