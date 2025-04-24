
import React from "react";
import { useNavigate } from "react-router-dom";
import { Film, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { useAppContext } from "@/context/AppContext";
import { CATEGORY_MAPPING } from "@/types/vod";

const Home = () => {
  const navigate = useNavigate();
  const { state } = useAppContext();
  
  const featuredChannels = state.channelGroups
    .flatMap(group => group.channels)
    .slice(0, 6);

  // Get a subset of movie categories for the home page
  const movieCategories = Object.keys(CATEGORY_MAPPING).slice(0, 4);
  
  const handleChannelClick = (channelId: string) => {
    navigate(`/watch/${channelId}`);
  };
  
  return (
    <SidebarLayout>
      <div className="monflix-container py-6">
        <h1 className="text-3xl font-bold mb-6">Benvenuto</h1>
        
        {/* Main sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <Button 
            variant="outline" 
            size="lg" 
            className="h-auto py-8 flex flex-col items-center space-y-4"
            onClick={() => navigate('/channels')}
          >
            <Tv size={40} />
            <div className="text-xl">Canali TV</div>
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="h-auto py-8 flex flex-col items-center space-y-4"
            onClick={() => navigate('/vod')}
          >
            <Film size={40} />
            <div className="text-xl">Film e Serie TV</div>
          </Button>
        </div>
        
        {/* Featured channels */}
        {featuredChannels.length > 0 && (
          <>
            <h2 className="text-xl font-bold mb-4">Canali in evidenza</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {featuredChannels.map(channel => (
                <Card key={channel.id} className="overflow-hidden">
                  <CardContent className="p-4 flex items-center justify-center aspect-video">
                    {channel.logo ? (
                      <img 
                        src={channel.logo} 
                        alt={channel.title} 
                        className="max-h-full max-w-full" 
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-sm text-muted-foreground text-center px-2">{channel.title}</span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="p-2">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="w-full" 
                      onClick={() => handleChannelClick(channel.id)}
                    >
                      Guarda
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            <div className="mt-4 text-right">
              <Button 
                variant="outline" 
                onClick={() => navigate('/channels')}
              >
                Vedi tutti i canali
              </Button>
            </div>
          </>
        )}
        
        {/* Featured movie categories */}
        <h2 className="text-xl font-bold mb-4 mt-10">Categorie film in evidenza</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {movieCategories.map((category, index) => (
            <Card key={index} className="overflow-hidden cursor-pointer hover:bg-accent/50 transition-colors" 
                  onClick={() => navigate('/vod')}>
              <CardContent className="p-4 flex items-center justify-center h-24">
                <span className="text-center font-medium">{category}</span>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-4 text-right">
          <Button 
            variant="outline" 
            onClick={() => navigate('/vod')}
          >
            Esplora film e serie TV
          </Button>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default Home;
