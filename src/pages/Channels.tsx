
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { Channel } from "@/types";

const Channels = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Get all channels
  const allChannels = state.channelGroups.flatMap(group => group.channels);
  
  // Filter channels based on search term
  const filteredChannels = allChannels.filter(channel => 
    channel.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (channel.groupTitle && channel.groupTitle.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const handleChannelClick = (channel: Channel) => {
    dispatch({ type: "SET_ACTIVE_CHANNEL", payload: channel });
    navigate(`/watch/${channel.id}`);
  };
  
  return (
    <SidebarLayout>
      <div className="monflix-container fade-in">
        <h1 className="text-3xl font-bold mb-6">Canali TV</h1>
        
        {/* Search box */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <Input
            className="pl-10"
            placeholder="Cerca canali..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Channel list */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredChannels.map(channel => (
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
                  {channel.groupTitle && (
                    <p className="text-xs text-muted-foreground truncate">{channel.groupTitle}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {filteredChannels.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nessun canale trovato</p>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default Channels;
