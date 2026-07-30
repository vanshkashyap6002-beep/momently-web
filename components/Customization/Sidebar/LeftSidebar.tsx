import { Image as ImageIcon, Video, Music2, GitBranch, MessageSquareText, Palette, Sticker } from "lucide-react";
import { CollapsibleSection } from "./CollapsibleSection";
import { PhotoUploader } from "./PhotoUploader";
import { VideoUploader } from "./VideoUploader";
import { MusicSelector } from "./MusicSelector";
import { TimelineEditor } from "./TimelineEditor";
import { MessagesPanel } from "./MessagesPanel";
import { ThemePanel } from "./ThemePanel";
import { StickerPanel } from "./StickerPanel";

export function LeftSidebar() {
  return (
    <div className="h-full overflow-y-auto">
      <CollapsibleSection title="Photos" icon={ImageIcon} defaultOpen>
        <PhotoUploader />
      </CollapsibleSection>
      <CollapsibleSection title="Videos" icon={Video}>
        <VideoUploader />
      </CollapsibleSection>
      <CollapsibleSection title="Music" icon={Music2}>
        <MusicSelector />
      </CollapsibleSection>
      <CollapsibleSection title="Timeline" icon={GitBranch}>
        <TimelineEditor />
      </CollapsibleSection>
      <CollapsibleSection title="Messages" icon={MessageSquareText}>
        <MessagesPanel />
      </CollapsibleSection>
      <CollapsibleSection title="Theme" icon={Palette}>
        <ThemePanel />
      </CollapsibleSection>
      <CollapsibleSection title="Stickers" icon={Sticker}>
        <StickerPanel />
      </CollapsibleSection>
    </div>
  );
}
