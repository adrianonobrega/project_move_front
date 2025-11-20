"use client";
import React, { useRef, useEffect } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

interface VideoPlayerProps {
  options: any;
  onReady?: (player: any) => void;
}

export const VideoPlayer = (props: VideoPlayerProps) => {
  const videoNode = useRef<HTMLVideoElement>(null);
  const player = useRef<any>(null);

  useEffect(() => {
    if (!player.current && videoNode.current) {
      player.current = videojs(videoNode.current, props.options, () => {
        props.onReady && props.onReady(player.current);
      });
    } else {
      if (player.current) {
        player.current.autoplay(props.options.autoplay);
        player.current.src(props.options.sources);
      }
    }
  }, [props.options]);

  useEffect(() => {
    const playerCurrent = player.current;
    return () => {
      if (playerCurrent && !playerCurrent.isDisposed()) {
        playerCurrent.dispose();
        player.current = null;
      }
    };
  }, []);

  return (
    <div data-vjs-player>
      <video ref={videoNode} className="video-js vjs-big-play-centered" />
    </div>
  );
};