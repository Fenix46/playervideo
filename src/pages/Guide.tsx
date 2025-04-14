
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppContext } from "@/context/AppContext";
import { Channel, EPGItem } from "@/types";

const Guide = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Get all channels
  const allChannels = state.channelGroups.flatMap(group => group.channels);
  
  // Generate dates for the next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });
  
  const handleChannelClick = (channel: Channel) => {
    dispatch({ type: "SET_ACTIVE_CHANNEL", payload: channel });
    navigate(`/watch/${channel.id}`);
  };
  
  // Function to format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('it-IT', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  };
  
  // Function to get programs for a specific channel and date
  const getChannelPrograms = (channel: Channel, date: string) => {
    if (!state.epgData[channel.id]) return [];
    
    return state.epgData[channel.id].filter(program => {
      const programDate = new Date(program.startTime).toISOString().split('T')[0];
      return programDate === date;
    });
  };
  
  return (
    <SidebarLayout>
      <div className="monflix-container fade-in">
        <h1 className="text-3xl font-bold mb-6">Guida TV</h1>
        
        <Tabs defaultValue={selectedDate} onValueChange={setSelectedDate}>
          <TabsList className="mb-6 overflow-x-auto flex w-full">
            {dates.map(date => (
              <TabsTrigger 
                key={date.toISOString()} 
                value={date.toISOString().split('T')[0]}
                className="min-w-[100px]"
              >
                {formatDate(date)}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {dates.map(date => (
            <TabsContent key={date.toISOString()} value={date.toISOString().split('T')[0]}>
              <div className="space-y-6">
                {state.channelGroups.map(group => (
                  <div key={group.title} className="space-y-4">
                    <h2 className="text-xl font-semibold">{group.title}</h2>
                    
                    <div className="space-y-4">
                      {group.channels.map(channel => (
                        <Card key={channel.id} className="overflow-hidden">
                          <CardContent className="p-0">
                            <div className="flex items-center p-4 border-b border-border cursor-pointer"
                                 onClick={() => handleChannelClick(channel)}>
                              <div className="h-10 w-10 bg-muted rounded-md overflow-hidden mr-3 flex-shrink-0">
                                {channel.logo ? (
                                  <img src={channel.logo} alt={channel.title} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center">
                                    <span className="text-xs font-medium">{channel.title.substring(0, 2)}</span>
                                  </div>
                                )}
                              </div>
                              <h3 className="font-medium">{channel.title}</h3>
                            </div>
                            
                            <div className="p-4">
                              {getChannelPrograms(channel, selectedDate).length > 0 ? (
                                <div className="space-y-2">
                                  {getChannelPrograms(channel, selectedDate).map((program: EPGItem) => (
                                    <div key={program.id} className="flex border-b border-border/50 last:border-0 pb-2 last:pb-0">
                                      <div className="w-20 flex-shrink-0 text-muted-foreground">
                                        {new Date(program.startTime).toLocaleTimeString('it-IT', { 
                                          hour: '2-digit', 
                                          minute: '2-digit' 
                                        })}
                                      </div>
                                      <div>
                                        <h4 className="font-medium">{program.title}</h4>
                                        {program.description && (
                                          <p className="text-sm text-muted-foreground mt-1">{program.description}</p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-muted-foreground text-sm">Nessuna programmazione disponibile</p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </SidebarLayout>
  );
};

export default Guide;
