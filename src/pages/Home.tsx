
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useAppContext } from "@/context/AppContext";
import { generateMockChannels } from "@/lib/api";
import { Channel } from "@/types";

const Home = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  
  // Load mock channels if none exist
  useEffect(() => {
    if (!state.user?.isLoggedIn) {
      navigate("/");
      return;
    }
    
    if (state.channelGroups.length === 0) {
      const mockChannels = generateMockChannels();
      dispatch({ type: "LOAD_CHANNELS", payload: mockChannels });
    }
  }, [state.user, state.channelGroups.length, dispatch, navigate]);
  
  const handleChannelClick = (channel: Channel) => {
    dispatch({ type: "SET_ACTIVE_CHANNEL", payload: channel });
    navigate(`/watch/${channel.id}`);
  };
  
  return (
    <SidebarLayout>
      <div className="monflix-container fade-in">
        <h1 className="text-3xl font-bold mb-6">Benvenuto su MonFlix</h1>
        
        {state.lastUpdated && (
          <p className="text-sm text-muted-foreground mb-4">
            Ultimo aggiornamento: {new Date(state.lastUpdated).toLocaleTimeString('it-IT')}
          </p>
        )}
        
        {/* Featured content */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contenuti in evidenza</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.channelGroups.length > 0 && 
              state.channelGroups[0].channels.slice(0, 3).map(channel => (
                <Card 
                  key={channel.id} 
                  className="channel-card card-hover cursor-pointer"
                  onClick={() => handleChannelClick(channel)}
                >
                  <CardContent className="p-0">
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      {channel.logo ? (
                        <img 
                          src={channel.logo} 
                          alt={channel.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-lg font-medium">{channel.title}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium">{channel.title}</h3>
                      <p className="text-sm text-muted-foreground">{channel.groupTitle}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            }
          </div>
        </section>
        
        {/* Channel categories */}
        {state.channelGroups.map(group => (
          <section key={group.title} className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{group.title}</h2>
              <button 
                onClick={() => navigate(`/category/${encodeURIComponent(group.title)}`)}
                className="text-sm text-primary hover:underline"
              >
                Vedi tutti
              </button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {group.channels.slice(0, 5).map(channel => (
                <Card 
                  key={channel.id} 
                  className="channel-card card-hover cursor-pointer"
                  onClick={() => handleChannelClick(channel)}
                >
                  <CardContent className="p-0">
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      {channel.logo ? (
                        <img 
                          src={channel.logo} 
                          alt={channel.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-lg font-medium">{channel.title}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium truncate">{channel.title}</h3>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </SidebarLayout>
  );
};

export default Home;
