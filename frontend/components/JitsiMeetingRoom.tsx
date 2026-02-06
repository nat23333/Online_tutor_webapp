'use client';

import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, LogOut, Maximize2 } from 'lucide-react';

interface JitsiMeetingRoomProps {
  roomName: string;
  userName: string;
  userEmail?: string;
  meetingLink?: string;
  onLeave?: () => void;
  autoJoin?: boolean;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export function JitsiMeetingRoom({
  roomName,
  userName,
  userEmail = '',
  meetingLink = '',
  onLeave,
  autoJoin = true,
}: JitsiMeetingRoomProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);

  useEffect(() => {
    // Load Jitsi script
    const script = document.createElement('script');
    script.src = 'https://meet.jitsi.org/external_api.js';
    script.async = true;

    script.onload = () => {
      if (containerRef.current && window.JitsiMeetExternalAPI) {
        const options = {
          roomName: roomName,
          width: '100%',
          height: '100%',
          parentNode: containerRef.current,
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            disableSimulcast: false,
          },
          interfaceConfigOverwrite: {
            DEFAULT_BACKGROUND: '#040404',
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            TOOLBAR_BUTTONS: [
              'microphone',
              'camera',
              'closedcaptions',
              'desktop',
              'fullscreen',
              'fodeviceselection',
              'hangup',
              'profile',
              'settings',
              'raisehand',
              'videoquality',
              'filmstrip',
              'feedback',
              'stats',
              'shortcuts',
              'tileview',
              'select-background',
              'download',
            ],
            SETTINGS_SECTIONS: [
              'devices',
              'language',
              'moderator',
              'profile',
              'calendar',
              'sounds',
              'more',
            ],
          },
          userInfo: {
            displayName: userName,
            email: userEmail,
          },
        };

        try {
          jitsiApiRef.current = new window.JitsiMeetExternalAPI(
            'meet.jitsi.org',
            options
          );

          // Event listeners
          jitsiApiRef.current.addEventListener('videoConferenceLeft', () => {
            console.log('User left the conference');
            onLeave?.();
          });

          jitsiApiRef.current.addEventListener('participantJoined', (event: any) => {
            console.log('Participant joined:', event.detail);
          });

          jitsiApiRef.current.addEventListener('participantLeft', (event: any) => {
            console.log('Participant left:', event.detail);
          });

          jitsiApiRef.current.addEventListener('readyToClose', () => {
            console.log('Jitsi is ready to close');
          });
        } catch (error) {
          console.error('Error initializing Jitsi:', error);
        }
      }
    };

    script.onerror = () => {
      console.error('Failed to load Jitsi Meet script');
    };

    document.body.appendChild(script);

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [roomName, userName, userEmail, onLeave]);

  const handleLeave = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('hangup');
    }
  };

  const handleFullscreen = () => {
    const container = containerRef.current;
    if (container) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        container.requestFullscreen?.();
      }
    }
  };

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="w-full rounded-lg overflow-hidden bg-black"
        style={{ minHeight: '600px', height: 'calc(100vh - 200px)' }}
      />

      <div className="flex gap-2 justify-end">
        <Button
          onClick={handleFullscreen}
          variant="outline"
          size="sm"
          className="gap-2 bg-transparent"
        >
          <Maximize2 className="h-4 w-4" />
          Fullscreen
        </Button>
        <Button
          onClick={handleLeave}
          variant="destructive"
          size="sm"
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          Leave Meeting
        </Button>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex gap-2">
        <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900 dark:text-blue-100">
          <p className="font-medium">Session Tips</p>
          <ul className="mt-1 space-y-0.5 text-xs opacity-90">
            <li>• Keep your camera and microphone on</li>
            <li>• Use screen sharing to show your work</li>
            <li>• Take notes during the session</li>
            <li>• Ask questions anytime - no judgment!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
