
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/AppContext";
import { logoutUser } from "@/lib/api";
import { Menu, Home, Tv, Film, Calendar, Settings, LogOut, X, ChevronRight } from "lucide-react";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  to: string;
  active: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, to, active }) => {
  return (
    <Link to={to} className={`sidebar-item ${active ? "active" : ""}`}>
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  );
};

const SidebarLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  
  const handleLogout = () => {
    logoutUser();
    dispatch({ type: "SET_USER", payload: null });
    navigate("/");
  };
  
  // Navigation items
  const navItems = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: Tv, label: "Canali TV", path: "/channels" },
    { icon: Film, label: "Film", path: "/movies" },
    { icon: Calendar, label: "Guida TV", path: "/guide" },
    { icon: Settings, label: "Impostazioni", path: "/settings" },
  ];
  
  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-30">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setSidebarOpen(true)}
          className="bg-secondary/80 backdrop-blur-sm"
        >
          <Menu size={20} />
        </Button>
      </div>
      
      {/* Sidebar */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border
          transform transition-transform duration-300 ease-in-out lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
          <Link to="/home" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">MonFlix</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X size={20} />
          </Button>
        </div>
        
        {/* Sidebar content */}
        <div className="flex flex-col justify-between h-[calc(100%-4rem)]">
          <div className="px-2 py-4 overflow-y-auto">
            <div className="space-y-1">
              {navItems.map((item) => (
                <SidebarItem
                  key={item.path}
                  icon={item.icon}
                  label={item.label}
                  to={item.path}
                  active={location.pathname === item.path}
                />
              ))}
            </div>
            
            {/* Channel categories */}
            {state.channelGroups.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase">
                  Categorie
                </h3>
                <div className="space-y-1">
                  {state.channelGroups.map((group) => (
                    <Link 
                      key={group.title}
                      to={`/category/${encodeURIComponent(group.title)}`}
                      className="sidebar-item"
                    >
                      <ChevronRight size={16} />
                      <span>{group.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar footer */}
          <div className="p-4 border-t border-sidebar-border">
            {state.user && (
              <div className="flex items-center justify-between">
                <div className="truncate">
                  <p className="text-sm font-medium">{state.user.username}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLogout}
                  aria-label="Logout"
                >
                  <LogOut size={18} />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        {/* Backdrop for mobile sidebar */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Content */}
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
};

export default SidebarLayout;
