'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Film, Heart, Sparkles, Users, ArrowRight, Star, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';

const FEATURED_POSTERS = [
  'https://image.tmdb.org/t/p/w342/1E5baAaEse26fej7uHcjOgEE2t2.jpg',
  'https://image.tmdb.org/t/p/w342/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
  'https://image.tmdb.org/t/p/w342/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg',
  'https://image.tmdb.org/t/p/w342/9cqNxx0GxF0bAY4deAmriISEpzQ.jpg',
  'https://image.tmdb.org/t/p/w342/74xTEgt7R36Fpooo50r9T25onhq.jpg',
  'https://image.tmdb.org/t/p/w342/NNxYkU70HPurnNCSiCjYAmacwm.jpg',
];

const features = [
  {
    icon: Sparkles,
    title: 'Matching Inteligente',
    description: 'Cuando tú y tu amigo/a dais like a la misma película, ¡es un match! Te lo notificamos al instante.',
    color: 'from-violet-500 to-fuchsia-500',
  },
  {
    icon: Film,
    title: 'Millones de títulos',
    description: 'Accede a toda la base de datos de TMDB: películas, series, documentales y más.',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    icon: Users,
    title: 'Sistema Social',
    description: 'Conecta con amigos, envía solicitudes y descubre qué están viendo las personas que más te importan.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Zap,
    title: 'Recomendaciones a medida',
    description: 'Un motor de recomendaciones basado en tus gustos y los de tu compañero/a de maratón.',
    color: 'from-amber-500 to-orange-500',
  },
];

const stats = [
  { value: '1M+', label: 'Películas y series' },
  { value: '100%', label: 'Gratis' },
  { value: 'Realtime', label: 'Notificaciones' },
  { value: '∞', label: 'Matches posibles' },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) router.push('/dashboard');
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-cinema-950 overflow-x-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 glass">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
              <Film className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">DuoWatch</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Iniciar sesión</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Empezar gratis</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-900/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8 border border-violet-500/20">
              <Sparkles className="h-4 w-4 text-violet-400" />
              <span className="text-sm text-violet-300 font-medium">La app que resuelve el "¿qué vemos?"</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-black leading-tight mb-6">
              <span className="text-foreground">Encuentra películas</span>
              <br />
              <span className="text-gradient">para ver juntos</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-10 max-w-lg leading-relaxed">
              DuoWatch combina matching social, recomendaciones inteligentes y la mayor base de datos de cine para que nunca más os peleéis eligiendo película.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register">
                <Button size="xl" variant="gradient" className="w-full sm:w-auto gap-2 group">
                  Empieza ahora gratis
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="xl" variant="outline" className="w-full sm:w-auto">
                  Ya tengo cuenta
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-8 mt-12">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-black text-gradient">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="relative h-[600px]">
              <div className="grid grid-cols-3 gap-4 absolute inset-0">
                {FEATURED_POSTERS.map((url, i) => (
                  <motion.div
                    key={i}
                    className="poster-card rounded-2xl overflow-hidden shadow-2xl"
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 3 + i * 0.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: i * 0.3,
                    }}
                    style={{ marginTop: i % 2 === 0 ? '0' : '32px' }}
                  >
                    <div className="relative aspect-[2/3] w-full">
                      <Image
                        src={url}
                        alt="Movie poster"
                        fill
                        className="object-cover"
                        sizes="150px"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                className="absolute bottom-16 left-1/2 -translate-x-1/2 glass-strong rounded-2xl px-6 py-4 border border-violet-500/30 min-w-64"
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-match flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gradient-match">¡Nuevo Match!</p>
                    <p className="text-xs text-muted-foreground">Dune: Parte 2 — 87% compatibles</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-4">
              Todo lo que necesitáis <span className="text-gradient">para decidir</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Una plataforma completa diseñada para parejas, amigos y familias que quieren disfrutar del cine juntos.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="card-cinema p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 border-y border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-strong rounded-3xl p-12 border border-violet-500/20"
          >
            <div className="h-16 w-16 rounded-2xl bg-gradient-match flex items-center justify-center mx-auto mb-6 shadow-xl shadow-violet-900/40">
              <Heart className="h-8 w-8 text-white fill-white" />
            </div>
            <h2 className="text-4xl font-black mb-4">
              Empieza a <span className="text-gradient">hacer match</span> hoy
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
              Únete y descubre el placer de encontrar películas que os gusten a los dos. Es rápido, gratis y divertido.
            </p>
            <Link href="/register">
              <Button size="xl" variant="gradient" className="gap-2 group">
                Crear mi cuenta gratis
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
              <Film className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-gradient">DuoWatch</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 DuoWatch. Powered by{' '}
            <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">
              TMDB
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
