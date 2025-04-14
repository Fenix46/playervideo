
import React from "react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";

const Settings = () => {
  const { toast } = useToast();
  
  const handleSaveClick = () => {
    toast({
      title: "Impostazioni salvate",
      description: "Le tue impostazioni sono state aggiornate con successo.",
    });
  };
  
  return (
    <SidebarLayout>
      <div className="monflix-container fade-in">
        <h1 className="text-3xl font-bold mb-6">Impostazioni</h1>
        
        <div className="grid gap-6 max-w-3xl">
          {/* Account settings */}
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>
                Gestisci le impostazioni del tuo account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nome utente</Label>
                <Input id="username" placeholder="Nome utente" defaultValue="utente123" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" />
                <p className="text-sm text-muted-foreground">
                  Lascia vuoto per mantenere la password corrente
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Playback settings */}
          <Card>
            <CardHeader>
              <CardTitle>Riproduzione</CardTitle>
              <CardDescription>
                Configura le impostazioni di riproduzione video
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Qualità automatica</h3>
                  <p className="text-sm text-muted-foreground">
                    Adatta automaticamente la qualità in base alla connessione
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quality">Qualità predefinita</Label>
                <select 
                  id="quality" 
                  className="input-field"
                  defaultValue="1080p"
                >
                  <option value="480p">480p</option>
                  <option value="720p">720p</option>
                  <option value="1080p">1080p (HD)</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Avvio automatico</h3>
                  <p className="text-sm text-muted-foreground">
                    Riproduci automaticamente i canali all'apertura
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
          
          {/* EPG settings */}
          <Card>
            <CardHeader>
              <CardTitle>Guida TV (EPG)</CardTitle>
              <CardDescription>
                Configura le impostazioni della guida TV
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Mostra EPG durante la riproduzione</h3>
                  <p className="text-sm text-muted-foreground">
                    Visualizza le informazioni sulla programmazione durante la visione
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="epgDays">Giorni visualizzati nella guida</Label>
                <select 
                  id="epgDays" 
                  className="input-field"
                  defaultValue="7"
                >
                  <option value="1">1 giorno</option>
                  <option value="3">3 giorni</option>
                  <option value="7">7 giorni</option>
                </select>
              </div>
            </CardContent>
          </Card>
          
          <Button className="w-full md:w-auto" onClick={handleSaveClick}>Salva impostazioni</Button>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default Settings;
