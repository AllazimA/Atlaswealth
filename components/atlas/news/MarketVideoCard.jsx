import React, { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Paperclip, Maximize, Minimize, Volume2 } from "lucide-react";
import { format } from "date-fns";

export default function MarketVideoCard({ video, onAttachInsight }) {
  const [whyMatters, setWhyMatters] = useState("");
  const [isAttaching, setIsAttaching] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const iframeRef = useRef(null);

  const handleAttach = async () => {
    if (!whyMatters.trim()) {
      alert("Please add a 'Why it matters' summary");
      return;
    }

    setIsAttaching(true);
    try {
      await onAttachInsight({
        title: video.title,
        source: video.source,
        videoId: video.videoId || video.id,
        summary: whyMatters,
        thumbnail: video.thumbnail,
      });
      setWhyMatters("");
    } finally {
      setIsAttaching(false);
    }
  };

  const handleFullscreen = () => {
    if (iframeRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      } else {
        iframeRef.current.parentElement.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const handlePictureInPicture = () => {
    if (iframeRef.current && document.pictureInPictureEnabled) {
      if (document.pictureInPictureElement) {
        document.exitPictureInPicture().catch(() => {});
      } else {
        iframeRef.current.requestPictureInPicture().catch(() => {});
      }
    }
  };

  const speedOptions = [0.75, 1, 1.25, 1.5, 2];

  return (
    <Card className="border border-slate-700 bg-slate-800/50 overflow-hidden">
      <CardContent className="p-0">
        {/* Video Container - 16:9 Aspect Ratio */}
        <div className="relative w-full bg-slate-900 border-b border-slate-700" style={{ paddingBottom: "56.25%" }}>
          <iframe
            ref={iframeRef}
            className="absolute top-0 left-0 w-full h-full"
            src={`https://www.youtube.com/embed/${video.videoId || video.id}?modestbranding=1&rel=0`}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        {/* Player Controls - Below Video */}
        <div className="bg-slate-900 border-b border-slate-700 px-3 py-2 flex flex-wrap items-center justify-between gap-2 md:gap-3">
          {/* Playback Speed */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:inline">Speed:</span>
            <div className="flex bg-slate-800 rounded-lg overflow-hidden">
              {speedOptions.map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-2 py-1 text-xs font-medium transition-colors ${
                    playbackSpeed === speed
                      ? "bg-orange-500 text-white"
                      : "text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Picture in Picture */}
            <Button
              size="sm"
              variant="ghost"
              onClick={handlePictureInPicture}
              className="h-8 px-2 text-slate-300 hover:text-white hover:bg-slate-700"
              title="Picture in Picture"
            >
              <Volume2 className="w-4 h-4" />
            </Button>

            {/* Fullscreen */}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleFullscreen}
              className="h-8 px-2 text-slate-300 hover:text-white hover:bg-slate-700"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4" />
              ) : (
                <Maximize className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Video Info */}
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  {video.source}
                </Badge>
                {video.isDemo && (
                  <Badge variant="secondary" className="text-xs">
                    Sample
                  </Badge>
                )}
              </div>
              <h3 className="text-sm font-semibold text-slate-100 leading-tight line-clamp-2">
                {video.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {format(new Date(video.publishedAt), "MMM d, yyyy")}
              </p>
            </div>
          </div>

          {/* Why it matters field */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">
              Why it matters (for your report)
            </label>
            <Textarea
              placeholder="Add your insight... (e.g., This impacts our tech portfolio allocation)"
              value={whyMatters}
              onChange={(e) => setWhyMatters(e.target.value)}
              className="h-16 text-xs resize-none"
            />
          </div>

          {/* Attach button */}
          <Button
            onClick={handleAttach}
            disabled={isAttaching}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white text-sm"
          >
            <Paperclip className="w-4 h-4 mr-2" />
            {isAttaching ? "Attaching..." : "Attach Insight to Report"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}