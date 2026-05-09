-- Drop old unique index (userId, tmdbId, mediaType)
DROP INDEX "movie_interactions_userId_tmdbId_mediaType_key";

-- Create new unique index including action (allows liked + saved to coexist)
CREATE UNIQUE INDEX "movie_interactions_userId_tmdbId_mediaType_action_key" ON "movie_interactions"("userId", "tmdbId", "mediaType", "action");
