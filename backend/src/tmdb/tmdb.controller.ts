import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TmdbService } from './tmdb.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('movies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('movies')
export class TmdbController {
  constructor(private tmdb: TmdbService) {}

  @Get('trending')
  @ApiOperation({ summary: 'Get trending movies and TV shows' })
  getTrending(@Query('type') type: 'movie' | 'tv' | 'all' = 'all') {
    return this.tmdb.getTrending(type, 'week');
  }

  @Get('popular')
  @ApiOperation({ summary: 'Get popular movies' })
  getPopular(@Query('page') page = 1) {
    return this.tmdb.getPopularMovies(Number(page));
  }

  @Get('popular/tv')
  @ApiOperation({ summary: 'Get popular TV shows' })
  getPopularTV(@Query('page') page = 1) {
    return this.tmdb.getPopularTV(Number(page));
  }

  @Get('search')
  @ApiOperation({ summary: 'Search movies and TV shows' })
  async search(@Query('q') query: string, @Query('page') page = 1) {
    const { results } = await this.tmdb.searchMulti(query || '', Number(page));
    return results;
  }

  @Get('genres/movie')
  @ApiOperation({ summary: 'Get movie genres' })
  getMovieGenres() {
    return this.tmdb.getMovieGenres();
  }

  @Get('genres/tv')
  @ApiOperation({ summary: 'Get TV show genres' })
  getTVGenres() {
    return this.tmdb.getTVGenres();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get movie details by TMDB ID' })
  getMovieDetails(@Param('id') id: string) {
    return this.tmdb.getMovieDetails(Number(id));
  }

  @Get('tv/:id')
  @ApiOperation({ summary: 'Get TV show details by TMDB ID' })
  getTVDetails(@Param('id') id: string) {
    return this.tmdb.getTVDetails(Number(id));
  }
}
