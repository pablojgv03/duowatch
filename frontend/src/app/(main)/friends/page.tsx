'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, UserPlus, Check, X, Loader2, UserX, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useFriends,
  useFriendRequests,
  useUserSearch,
  useSendFriendRequest,
  useAcceptFriendRequest,
  useRejectFriendRequest,
  useRemoveFriend,
} from '@/hooks/use-friends';
import { useMatchesWithFriend } from '@/hooks/use-matches';
import { cn, getAvatarUrl, formatDate } from '@/lib/utils';

function FriendCard({ friendship }: { friendship: any }) {
  const removeFriend = useRemoveFriend();
  const { data: matches } = useMatchesWithFriend(friendship.friend.id);

  return (
    <motion.div
      className="card-cinema p-4 group"
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12 border border-violet-500/20">
          <AvatarImage src={getAvatarUrl(friendship.friend)} />
          <AvatarFallback>
            {(friendship.friend.displayName || friendship.friend.username)[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">
            {friendship.friend.displayName || friendship.friend.username}
          </p>
          <p className="text-sm text-muted-foreground">@{friendship.friend.username}</p>
          {matches && matches.length > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <Sparkles className="h-3 w-3 text-violet-400" />
              <span className="text-xs text-violet-400">{matches.length} matches juntos</span>
            </div>
          )}
        </div>

        <button
          onClick={() => removeFriend.mutate(friendship.friendshipId)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-2 rounded-lg hover:bg-destructive/10"
          disabled={removeFriend.isPending}
        >
          <UserX className="h-4 w-4" />
        </button>
      </div>

      {friendship.friend.bio && (
        <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{friendship.friend.bio}</p>
      )}

      <p className="text-[10px] text-muted-foreground/60 mt-2">
        Amigos desde {formatDate(friendship.since)}
      </p>
    </motion.div>
  );
}

function RequestCard({ request, onAccept, onReject, accepting, rejecting }: any) {
  return (
    <motion.div
      className="card-cinema p-4"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      layout
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-11 w-11">
          <AvatarImage src={request.requester ? getAvatarUrl(request.requester) : ''} />
          <AvatarFallback>
            {(request.requester?.displayName || request.requester?.username || '?')[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">
            {request.requester?.displayName || request.requester?.username}
          </p>
          <p className="text-sm text-muted-foreground">@{request.requester?.username}</p>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onReject(request.id)}
            disabled={rejecting}
            className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            {rejecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
          </Button>
          <Button
            size="sm"
            onClick={() => onAccept(request.id)}
            disabled={accepting}
            className="h-9 px-3"
          >
            {accepting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function SearchResult({ user, onAdd, isPending }: any) {
  return (
    <div className="flex items-center gap-3 p-3 glass rounded-xl">
      <Avatar className="h-10 w-10">
        <AvatarImage src={getAvatarUrl(user)} />
        <AvatarFallback>{(user.displayName || user.username)[0].toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{user.displayName || user.username}</p>
        <p className="text-xs text-muted-foreground">@{user.username}</p>
      </div>
      <Button size="sm" onClick={() => onAdd(user.id)} disabled={isPending} variant="outline" className="gap-1 shrink-0">
        {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserPlus className="h-3 w-3" />}
        Añadir
      </Button>
    </div>
  );
}

export default function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState<'friends' | 'requests'>('friends');

  const { data: friends, isLoading: friendsLoading } = useFriends();
  const { data: requests, isLoading: requestsLoading } = useFriendRequests();
  const { data: searchResults, isLoading: searching } = useUserSearch(searchQuery);
  const sendRequest = useSendFriendRequest();
  const acceptRequest = useAcceptFriendRequest();
  const rejectRequest = useRejectFriendRequest();

  const pendingRequests = requests?.filter((r) => r.status === 'PENDING') || [];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-black flex items-center gap-2">
          <Users className="h-7 w-7 text-emerald-400" />
          Amigos
        </h1>
        <p className="text-muted-foreground mt-1">Conecta con tus amigos y empieza a hacer matches</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Buscar usuarios por nombre o @username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <AnimatePresence>
        {searchQuery.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="card-cinema p-4"
          >
            <p className="text-sm font-semibold text-muted-foreground mb-3">Resultados de búsqueda</p>
            {searching ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
              </div>
            ) : (searchResults?.length ?? 0) > 0 ? (
              <div className="space-y-2">
                {(searchResults ?? []).map((user) => (
                  <SearchResult
                    key={user.id}
                    user={user}
                    onAdd={sendRequest.mutate}
                    isPending={sendRequest.isPending}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No encontramos a nadie con ese nombre
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex glass rounded-xl p-1 gap-1 w-fit">
        <button
          onClick={() => setTab('friends')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            tab === 'friends' ? 'bg-violet-600 text-white' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Users className="h-4 w-4" />
          Amigos
          {friends && friends.length > 0 && (
            <Badge variant="default" className="h-5 min-w-5 text-xs">{friends.length}</Badge>
          )}
        </button>
        <button
          onClick={() => setTab('requests')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            tab === 'requests' ? 'bg-violet-600 text-white' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <UserPlus className="h-4 w-4" />
          Solicitudes
          {pendingRequests.length > 0 && (
            <Badge variant="match" className="h-5 min-w-5 text-xs">{pendingRequests.length}</Badge>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'friends' ? (
          <motion.div key="friends" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {friendsLoading ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
              </div>
            ) : friends && friends.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {friends.map((friendship) => (
                  <FriendCard key={friendship.friendshipId} friendship={friendship} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Users className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
                <p className="font-semibold text-lg">Aún no tienes amigos</p>
                <p className="text-sm text-muted-foreground">Busca a tus amigos con el buscador de arriba</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="requests" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {requestsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
              </div>
            ) : pendingRequests.length > 0 ? (
              <div className="space-y-3">
                <AnimatePresence>
                  {pendingRequests.map((req) => (
                    <RequestCard
                      key={req.id}
                      request={req}
                      onAccept={acceptRequest.mutate}
                      onReject={rejectRequest.mutate}
                      accepting={acceptRequest.isPending}
                      rejecting={rejectRequest.isPending}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-16">
                <UserPlus className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
                <p className="font-semibold">Sin solicitudes pendientes</p>
                <p className="text-sm text-muted-foreground">Cuando alguien quiera ser tu amigo aparecerá aquí</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
