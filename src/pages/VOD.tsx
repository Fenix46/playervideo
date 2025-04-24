
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Film, Tv, Play, ChevronLeft, Home } from "lucide-react";
import { ScMovie, ScSeries, ScEpisode, ScCategory, CATEGORY_MAPPING } from "@/types/vod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { 
  initStreamingCommunity, 
  searchMovies, 
  searchSeries, 
  getSeasonCount, 
  getEpisodes, 
  getTmdbInfo,
  getMovieCategories,
  fetchMoviesByCategory
} from "@/lib/scApi";

const VOD: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("movies");
  const [movies, setMovies] = useState<ScMovie[]>([]);
  const [series, setSeries] = useState<ScSeries[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState<ScSeries | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [seasons, setSeasons] = useState<number[]>([]);
  const [episodes, setEpisodes] = useState<ScEpisode[]>([]);
  const [showSeasonDialog, setShowSeasonDialog] = useState(false);
  const [showEpisodeDialog, setShowEpisodeDialog] = useState(false);
  const [categories, setCategories] = useState<ScCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ScCategory | null>(null);
  const [categoryMovies, setCategoryMovies] = useState<ScMovie[]>([]);
  const [loadingCategory, setLoadingCategory] = useState(false);

  // Initialize StreamingCommunity and load categories on component mount
  useEffect(() => {
    const init = async () => {
      await initStreamingCommunity();
      const movieCategories = getMovieCategories();
      setCategories(movieCategories);
    };
    
    init();
  }, []);

  // Handle search
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error("Inserisci un termine di ricerca");
      return;
    }

    setLoading(true);
    setSelectedCategory(null);

    try {
      if (activeTab === "movies") {
        const results = await searchMovies(searchTerm);
        setMovies(results);
        setCategoryMovies([]);
      } else {
        const results = await searchSeries(searchTerm);
        setSeries(results);
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error(`Errore durante la ricerca di ${activeTab === "movies" ? "film" : "serie TV"}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle category selection
  const handleCategorySelect = async (category: ScCategory) => {
    setSelectedCategory(category);
    setLoadingCategory(true);
    setCategoryMovies([]);
    setMovies([]);
    
    try {
      const moviesForCategory = await fetchMoviesByCategory(category);
      setCategoryMovies(moviesForCategory);
    } catch (error) {
      console.error(`Error loading movies for category ${category.name}:`, error);
      toast.error(`Errore nel caricamento dei film per la categoria ${category.name}`);
    } finally {
      setLoadingCategory(false);
    }
  };

  // Handle movie play
  const handlePlayMovie = (movie: ScMovie) => {
    navigate(`/vod/watch`, { 
      state: { 
        type: 'sc_movie',
        movieId: movie.id,
        title: movie.name
      }
    });
  };

  // Show series seasons
  const handleShowSeasons = async (series: ScSeries) => {
    setLoading(true);
    setSelectedSeries(series);
    
    try {
      const seasonsCount = await getSeasonCount(series.id);
      if (seasonsCount > 0) {
        const seasonNumbers = Array.from({ length: seasonsCount }, (_, i) => i);
        setSeasons(seasonNumbers);
        setShowSeasonDialog(true);
      } else {
        toast.error("Nessuna stagione trovata per questa serie");
      }
    } catch (error) {
      console.error("Error getting seasons:", error);
      toast.error("Errore nel recupero delle stagioni");
    } finally {
      setLoading(false);
    }
  };

  // Show episodes for a season
  const handleShowEpisodes = async (seasonNumber: number) => {
    if (!selectedSeries) return;
    
    setLoading(true);
    setSelectedSeason(seasonNumber);
    setShowSeasonDialog(false);
    
    try {
      const slug = `${selectedSeries.id}-${selectedSeries.name.toLowerCase().replace(/\s+/g, '-')}`;
      const episodesList = await getEpisodes(selectedSeries.id, slug, seasonNumber);
      
      if (episodesList && episodesList.length > 0) {
        setEpisodes(episodesList);
        setShowEpisodeDialog(true);
      } else {
        toast.error("Nessun episodio trovato per questa stagione");
      }
    } catch (error) {
      console.error("Error getting episodes:", error);
      toast.error("Errore nel recupero degli episodi");
    } finally {
      setLoading(false);
    }
  };

  // Handle episode play
  const handlePlayEpisode = (episode: ScEpisode) => {
    if (!selectedSeries) return;
    
    navigate(`/vod/watch`, { 
      state: { 
        type: 'episode',
        seriesId: selectedSeries.id,
        episodeId: episode.id,
        title: `${selectedSeries.name} - S${selectedSeason! + 1}E${episode.number}`
      }
    });
  };

  // Go back to home
  const handleBackToHome = () => {
    navigate('/home');
  };

  // Clear search results and category selection
  const handleClearSelection = () => {
    setMovies([]);
    setCategoryMovies([]);
    setSelectedCategory(null);
    setSearchTerm('');
  };

  return (
    <SidebarLayout>
      <div className="monflix-container py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Film e Serie TV</h1>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleBackToHome}
              className="flex items-center gap-2"
            >
              <Home size={16} />
              <span>Home</span>
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="movies" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="movies" className="flex items-center gap-2">
              <Film size={18} />
              <span>Film</span>
            </TabsTrigger>
            <TabsTrigger value="series" className="flex items-center gap-2">
              <Tv size={18} />
              <span>Serie TV</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="flex flex-col md:flex-row items-start gap-4 mt-6">
            <div className="flex w-full md:w-auto items-center space-x-2">
              <Input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Cerca ${activeTab === "movies" ? "film" : "serie TV"}...`}
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button 
                onClick={handleSearch} 
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Search size={16} />
                <span>Cerca</span>
              </Button>
              {(movies.length > 0 || categoryMovies.length > 0 || series.length > 0) && (
                <Button 
                  variant="outline"
                  onClick={handleClearSelection}
                >
                  Cancella
                </Button>
              )}
            </div>
          </div>
          
          <TabsContent value="movies" className="mt-6">
            {/* Categories section */}
            {activeTab === "movies" && !selectedCategory && movies.length === 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Categorie Film</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {categories.map((category) => (
                    <Card 
                      key={category.id} 
                      className="cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => handleCategorySelect(category)}
                    >
                      <CardContent className="p-4 flex items-center justify-center h-24">
                        <span className="text-center font-medium">{category.name}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {/* Selected category */}
            {selectedCategory && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedCategory(null)}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft size={16} />
                    <span>Indietro</span>
                  </Button>
                  <h2 className="text-xl font-bold">Categoria: {selectedCategory.name}</h2>
                </div>
                
                {loadingCategory ? (
                  <div className="text-center py-10">
                    <p className="text-lg">Caricamento...</p>
                  </div>
                ) : categoryMovies.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {categoryMovies.map((movie) => (
                      <Card key={movie.id} className="overflow-hidden flex flex-col">
                        <div className="aspect-[2/3] relative overflow-hidden">
                          {movie.poster_path ? (
                            <img 
                              src={`https://media.themoviedb.org/t/p/w300_and_h450_bestv2${movie.poster_path}`} 
                              alt={movie.name} 
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <Film size={48} className="text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <CardContent className="flex-1 p-4">
                          <CardTitle className="text-base">{movie.name}</CardTitle>
                          {movie.overview && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                              {movie.overview}
                            </p>
                          )}
                        </CardContent>
                        <CardFooter className="pt-0 px-4 pb-4">
                          <Button 
                            onClick={() => handlePlayMovie(movie)} 
                            className="w-full flex items-center gap-2"
                          >
                            <Play size={16} />
                            <span>Guarda</span>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-lg">Nessun film trovato in questa categoria.</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Search results */}
            {loading ? (
              <div className="text-center py-10">
                <p className="text-lg">Caricamento...</p>
              </div>
            ) : movies.length > 0 ? (
              <div>
                <h2 className="text-xl font-bold mb-4">Risultati ricerca</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {movies.map((movie) => (
                    <Card key={movie.id} className="overflow-hidden flex flex-col">
                      <div className="aspect-[2/3] relative overflow-hidden">
                        {movie.poster_path ? (
                          <img 
                            src={`https://media.themoviedb.org/t/p/w300_and_h450_bestv2${movie.poster_path}`} 
                            alt={movie.name} 
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <Film size={48} className="text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <CardContent className="flex-1 p-4">
                        <CardTitle className="text-base">{movie.name}</CardTitle>
                        {movie.overview && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                            {movie.overview}
                          </p>
                        )}
                      </CardContent>
                      <CardFooter className="pt-0 px-4 pb-4">
                        <Button 
                          onClick={() => handlePlayMovie(movie)} 
                          className="w-full flex items-center gap-2"
                        >
                          <Play size={16} />
                          <span>Guarda</span>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            ) : searchTerm && !selectedCategory ? (
              <div className="text-center py-10">
                <p className="text-lg">
                  Nessun film trovato. Prova con un'altra ricerca.
                </p>
              </div>
            ) : null}
          </TabsContent>
          
          <TabsContent value="series" className="mt-6">
            {loading ? (
              <div className="text-center py-10">
                <p className="text-lg">Caricamento...</p>
              </div>
            ) : series.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {series.map((series) => (
                  <Card key={series.id} className="overflow-hidden flex flex-col">
                    <div className="aspect-[2/3] relative overflow-hidden">
                      {series.poster_path ? (
                        <img 
                          src={`https://media.themoviedb.org/t/p/w300_and_h450_bestv2${series.poster_path}`}
                          alt={series.name} 
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Tv size={48} className="text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <CardContent className="flex-1 p-4">
                      <CardTitle className="text-base">{series.name}</CardTitle>
                      {series.overview && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                          {series.overview}
                        </p>
                      )}
                    </CardContent>
                    <CardFooter className="pt-0 px-4 pb-4">
                      <Button 
                        onClick={() => handleShowSeasons(series)}
                        className="w-full flex items-center gap-2"
                      >
                        <Play size={16} />
                        <span>Guarda</span>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-lg">
                  {searchTerm ? "Nessuna serie trovata. Prova con un'altra ricerca." : "Cerca una serie TV"}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Seasons Dialog */}
      <Dialog open={showSeasonDialog} onOpenChange={setShowSeasonDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedSeries?.name} - Stagioni</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="grid gap-4 py-4">
              {seasons.map((seasonNumber) => (
                <Button 
                  key={seasonNumber}
                  onClick={() => handleShowEpisodes(seasonNumber)}
                >
                  Stagione {seasonNumber + 1}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      
      {/* Episodes Dialog */}
      <Dialog open={showEpisodeDialog} onOpenChange={setShowEpisodeDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedSeries?.name} - Stagione {selectedSeason !== null ? selectedSeason + 1 : ""}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="grid gap-4 py-4">
              {episodes.map((episode) => (
                <Button 
                  key={episode.id}
                  onClick={() => handlePlayEpisode(episode)}
                  variant="outline"
                  className="justify-start h-auto py-3"
                >
                  <div className="text-left">
                    <div className="font-medium">Episodio {episode.number}</div>
                    <div className="text-sm text-muted-foreground">{episode.title || `Episodio ${episode.number}`}</div>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </SidebarLayout>
  );
};

export default VOD;
