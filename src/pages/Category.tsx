
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/AppContext";
import { ArrowLeft } from "lucide-react";
import { Channel } from "@/types";

const Category = () => {
  const { categoryName } = useParams<{ categoryName: string }>();
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  
  // Find channels that belong to this category
  const group = state.channelGroups.find(g => 
    g.title === decodeURIComponent(categoryName || "")
  );
  
  const handleChannelClick = (channel: Channel) => {
    dispatch({ type: "SET_ACTIVE_CHANNEL", payload: channel });
    navigate(`/watch/${channel.id}`);
  };
  
  const handleBackClick = () => {
    navigate(-1);
  };
  
  if (!group) {
    return (
      <SidebarLayout>
        <div className="monflix-container">
          <div className="flex items-center space-x-2 mb-6">
            <Button variant="outline" size="icon" onClick={handleBackClick}>
              <ArrowLeft size={18} />
            </Button>
            <h1 className="text-2xl font-bold">Categoria non trovata</h1>
          </div>
          <p>La categoria richiesta non esiste.</p>
        </div>
      </SidebarLayout>
    );
  }
  
  return (
    <SidebarLayout>
      <div className="monflix-container fade-in">
        <div className="flex items-center space-x-2 mb-6">
          <Button variant="outline" size="icon" onClick={handleBackClick}>
            <ArrowLeft size={18} />
          </Button>
          <h1 className="text-2xl font-bold">{group.title}</h1>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {group.channels.map(channel => (
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
      </div>
    </SidebarLayout>
  );
};

export default Category;
