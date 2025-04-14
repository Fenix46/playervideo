
// Types for MonFlix application

// User authentication types
export interface AuthResponse {
  status: 'success' | 'error';
  message?: string;
  error?: string;
}

export interface User {
  username: string;
  isLoggedIn: boolean;
}

// Channel and stream related types
export interface Channel {
  id: string;
  title: string;
  logo?: string;
  staffId?: string;
  groupTitle?: string;
  url: string;
  streamProps: StreamProperties;
}

export interface StreamProperties {
  manifestType?: string;
  licenseType?: string;
  licenseKey?: string;
  streamHeaders?: Record<string, string>;
}

export interface ChannelGroup {
  title: string;
  channels: Channel[];
}

// EPG related types
export interface EPGItem {
  id: string;
  channelId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  duration: number;
}

export interface EPGData {
  [channelId: string]: EPGItem[];
}

// App state management
export interface AppState {
  user: User | null;
  channelGroups: ChannelGroup[];
  activeChannel?: Channel;
  epgData: EPGData;
  lastUpdated?: string;
}
