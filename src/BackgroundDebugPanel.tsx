import type { BackgroundSelection } from "./weatherConfig";
import { APP_SETTINGS } from "./appSettings";

type Props = {
  selection: BackgroundSelection;
  now: Date;
};

export default function BackgroundDebugPanel({ selection, now }: Props) {
  const debugEnabled = APP_SETTINGS.debugBackgroundPanel;
  if (!debugEnabled) return null;

  return (
    <div className="absolute bottom-3 left-3 z-30 max-w-[92vw] rounded-md border border-white/25 bg-black/60 px-3 py-2 text-left text-[11px] leading-4 text-white backdrop-blur">
      <div>
        <span className="font-semibold">reason:</span> {selection.reason}
      </div>
      <div>
        <span className="font-semibold">strategy:</span> {selection.strategy}
      </div>
      <div>
        <span className="font-semibold">image:</span> {selection.imageFile}
      </div>
      <div>
        <span className="font-semibold">season:</span> {selection.season}
      </div>
      <div>
        <span className="font-semibold">part:</span> {selection.partOfDay}
      </div>
      <div>
        <span className="font-semibold">weather:</span> {selection.weatherMain ?? "none"}
      </div>
      <div>
        <span className="font-semibold">time:</span> {now.toLocaleString()}
      </div>
    </div>
  );
}
