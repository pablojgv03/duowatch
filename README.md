# DuoWatch 🎬

**La plataforma social para encontrar películas y series que ver juntos.**

DuoWatch combina matching social, recomendaciones inteligentes y la mayor base de datos de cine para que nunca más os peleéis eligiendo película.

---

## Visión del Producto

El problema que resuelve: el clásico "¿qué vemos hoy?" que acaba en 30 minutos de scroll sin decidir nada.

DuoWatch lo resuelve de forma divertida, inteligente y social:

- Das like a películas que quieres ver
- Tus amigos hacen lo mismo
- Cuando coincidís → **Match** instantáneo con notificación realtime
- El motor de recomendaciones aprende de tus gustos y los de tus amigos

---

## Stack Tecnológico

### Frontend
| Tecnología | Versión | Uso |
|---|---|---|
| Next.js | 15 (App Router) | Framework React con SSR/SSG |
| TypeScript | 5.x | Tipado estático |
| TailwindCSS | 3.x | Estilos utility-first |
| shadcn/ui | latest | Componentes UI accesibles |
| Framer Motion | 11.x | Animaciones fluidas |
| Zustand | 5.x | Estado global del cliente |
| TanStack Query | 5.x | Server state, caché, mutations |

### Backend
| Tecnología | Versión | Uso |
|---|---|---|
| NestJS | 10.x | Framework Node.js modular |
| TypeScript | 5.x | Tipado estático |
| Prisma | 5.x | ORM type-safe |
| PostgreSQL | 16 | Base de datos relacional |
| Socket.IO | 4.x | Comunicación realtime |
| JWT | - | Autenticación stateless |
| TMDB API | v3 | Datos de películas y series |

### Infraestructura
- **Docker** + **docker-compose** para desarrollo local
- Arquitectura de microservicios preparada para escalar

---

## Arquitectura

```
duowatch/
├── frontend/                    # Next.js 15 App Router
│   └── src/
│       ├── app/
│       │   ├── (auth)/          # Login, Register
│       │   ├── (main)/          # Dashboard, Discover, Matches, Friends, Profile, Settings
│       │   ├── onboarding/      # Flujo de configuración inicial
│       │   └── page.tsx         # Landing page
│       ├── components/
│       │   ├── ui/              # Primitivos (Button, Input, Avatar...)
│       │   ├── movie/           # MovieCard, SwipeCard
│       │   ├── match/           # MatchCard
│       │   └── layout/          # Sidebar, MobileNav
│       ├── hooks/               # use-auth, use-movies, use-friends, use-matches, use-socket
│       ├── store/               # Zustand (auth.store, notifications.store)
│       ├── lib/                 # api.ts, utils.ts
│       └── types/               # Tipos TypeScript compartidos
│
├── backend/                     # NestJS modular
│   └── src/
│       ├── auth/                # JWT + Refresh tokens
│       ├── users/               # Perfiles de usuario
│       ├── friendships/         # Sistema de amistad
│       ├── tmdb/                # Integración TMDB API
│       ├── interactions/        # Likes, dislikes, watchlist
│       ├── matches/             # Motor de matching
│       ├── preferences/         # Preferencias del usuario
│       ├── recommendations/     # Motor de recomendaciones
│       ├── notifications/       # Sistema de notificaciones
│       ├── gateway/             # Socket.IO WebSocket
│       ├── prisma/              # Cliente Prisma
│       └── common/              # Filtros, interceptores, decoradores
│
├── docker-compose.yml
└── README.md
```

---

## Motor de Recomendaciones

DuoWatch usa un sistema de **weighted scoring** basado en:

### Recomendaciones personales
- **Genre match score (40%)**: coincidencia entre géneros del contenido y los favoritos del usuario
- **Rating score (40%)**: puntuación TMDB normalizada
- **Popularity score (20%)**: popularidad relativa del título

### Recomendaciones para dúo
- Combina los géneros favoritos de ambos usuarios
- Prioriza géneros compartidos (intersection over union)
- Excluye contenido que alguno de los dos ya ha visto
- **Jaccard similarity** entre listas de likes para calcular compatibilidad

### Compatibilidad entre usuarios
```
score = (jaccardGenres × 0.6) + (jaccardLikes × 0.4)
```

---

## Instalación y Desarrollo

### Requisitos
- Docker + Docker Compose
- API key de TMDB (gratis en [themoviedb.org](https://www.themoviedb.org/settings/api))

### Setup

1. **Clonar e instalar**
```bash
git clone https://github.com/yourusername/duowatch
cd duowatch
cp .env.example .env
```

2. **Configurar API key de TMDB**
```bash
# Editar backend/.env
TMDB_API_KEY=tu_api_key_aquí
```

3. **Levantar con Docker**
```bash
docker-compose up
```

4. **Ejecutar migraciones** (primera vez)
```bash
docker-compose exec backend npx prisma migrate dev --name init
```

La app estará disponible en:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Swagger docs**: http://localhost:3001/api/docs

### Desarrollo sin Docker

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Configurar DATABASE_URL apuntando a tu PostgreSQL local
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

---

## API Endpoints

| Módulo | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout` |
| Users | `GET /users/me`, `PATCH /users/me`, `GET /users/search`, `GET /users/:id` |
| Friendships | `GET /friendships`, `POST /friendships/request/:userId`, `PATCH /friendships/request/:id/accept` |
| Movies | `GET /movies/trending`, `GET /movies/search`, `GET /movies/:id`, `GET /movies/genres/movie` |
| Interactions | `POST /interactions`, `GET /interactions/me/liked`, `GET /interactions/me/watchlist` |
| Matches | `GET /matches/me`, `GET /matches/with/:friendId`, `GET /matches/stats` |
| Preferences | `GET /preferences/me`, `PUT /preferences/me` |
| Recommendations | `GET /recommendations`, `GET /recommendations/duo/:friendId` |
| Notifications | `GET /notifications`, `PATCH /notifications/:id/read` |

Documentación interactiva: `http://localhost:3001/api/docs`

---

## Modelo de Datos

```prisma
User              → perfil, auth, onboarding
FriendRequest     → solicitudes de amistad (PENDING/ACCEPTED/REJECTED)
Friendship        → relaciones de amistad confirmadas
UserPreferences   → géneros, tipos, puntuación mínima
MovieInteraction  → LIKED/DISLIKED/WATCHED/WANT_TO_WATCH
Match             → cuando dos amigos dan like al mismo contenido
Notification      → FRIEND_REQUEST/FRIEND_ACCEPTED/MATCH/RECOMMENDATION
```

---

## Realtime con Socket.IO

Eventos emitidos al cliente:
- `new_match` → cuando se genera un match con un amigo
- `friend_request` → cuando alguien envía una solicitud
- `friend_accepted` → cuando aceptan tu solicitud
- `pong` → respuesta al ping de keepalive

---

## Diseño Visual

- **Dark mode** por defecto con paleta cinematográfica
- Colores: `cinema-950` (#07070f) base, `violet-600` (#7c3aed) primario, `fuchsia-500` acento
- **Glass morphism** para cards y overlays
- **Framer Motion** para transiciones y animaciones
- Diseño **responsive**: sidebar en desktop, bottom nav en mobile
- Skeleton loaders para todos los estados de carga

---

## Futuras Mejoras

- [ ] OAuth (Google, Apple)
- [ ] Grupos de más de 2 personas
- [ ] Historial de sesiones de visionado
- [ ] Integración con servicios de streaming (Netflix, HBO...)
- [ ] Notificaciones push (PWA)
- [ ] Sistema de reviews y valoraciones
- [ ] IA para análisis de sentimiento de reviews
- [ ] Modo "¿qué vemos ahora?" con timer de decisión
- [ ] Listas colaborativas

---

## Licencia

MIT — Hecho con ❤️ y mucha cafeína.

Powered by [The Movie Database (TMDB)](https://www.themoviedb.org).
