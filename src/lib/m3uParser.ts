
import { Channel, StreamProperties } from "@/types";

/**
 * Parses M3U content into a list of Channel objects
 */
export function parseM3U(content: string): Channel[] {
  const lines = content.split("\n");
  const channels: Channel[] = [];
  
  let currentChannel: Partial<Channel> & { streamProps: StreamProperties } = {
    streamProps: {}
  };
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Parse the #EXTINF line which contains channel metadata
    if (line.startsWith("#EXTINF:")) {
      currentChannel = { streamProps: {} };
      
      // Extract title from the EXTINF line
      const titleMatch = line.match(/#EXTINF:.*,\s*(.*)$/);
      if (titleMatch) {
        currentChannel.title = titleMatch[1];
      }
      
      // Extract logo from tvg-logo attribute
      const logoMatch = line.match(/tvg-logo="([^"]*)"/);
      if (logoMatch) {
        currentChannel.logo = logoMatch[1];
      }
      
      // Extract group-title
      const groupMatch = line.match(/group-title="([^"]*)"/);
      if (groupMatch) {
        currentChannel.groupTitle = groupMatch[1];
      }
      
      // Extract staff-id if available
      const staffIdMatch = line.match(/staff-id="([^"]*)"/);
      if (staffIdMatch) {
        currentChannel.staffId = staffIdMatch[1];
      }
      
      currentChannel.id = `channel_${channels.length + 1}`;
    }
    
    // Parse KODIPROP lines for stream properties
    else if (line.startsWith("#KODIPROP:")) {
      const propMatch = line.match(/#KODIPROP:([^=]+)=(.*)$/);
      if (propMatch) {
        const [_, propName, propValue] = propMatch;
        
        // Map specific KODIPROP values to our streamProps object
        if (propName === "inputstream.adaptive.manifest_type") {
          currentChannel.streamProps.manifestType = propValue;
        } 
        else if (propName === "inputstream.adaptive.license_type") {
          currentChannel.streamProps.licenseType = propValue;
        }
        else if (propName === "inputstream.adaptive.license_key") {
          currentChannel.streamProps.licenseKey = propValue;
        }
        else if (propName === "inputstream.adaptive.stream_headers") {
          // Parse stream headers into our streamProps
          const headerParts = propValue.split("&");
          currentChannel.streamProps.streamHeaders = currentChannel.streamProps.streamHeaders || {};
          
          headerParts.forEach(part => {
            const [key, value] = part.split("=");
            if (key && value && currentChannel.streamProps.streamHeaders) {
              currentChannel.streamProps.streamHeaders[key] = value;
            }
          });
        }
      }
    }
    
    // Parse the actual stream URL line
    else if (!line.startsWith("#") && line.length > 0 && currentChannel.title) {
      currentChannel.url = line;
      
      // Add the completed channel to our list
      channels.push(currentChannel as Channel);
    }
  }
  
  return channels;
}
