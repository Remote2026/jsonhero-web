import { useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Body } from "~/components/Primitives/Body";
import { PreviewBox } from "../PreviewBox";
import { useTranslation } from "react-i18next";

export function PreviewVideoUri({
  src,
  contentType,
}: {
  src: string;
  contentType: string;
}) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);

  useHotkeys(
    "space",
    (e) => {
      e.preventDefault();

      if (videoRef.current) {
        if (videoRef.current.paused) {
          videoRef.current.play();
        } else {
          videoRef.current.pause();
        }
      }
    },
    [videoRef]
  );

  return (
    <div>
      <PreviewBox>
        <Body>
          <video key={src} controls ref={videoRef}>
            <source src={src} type={contentType} />
            {t("preview.videoNotSupported")}
          </video>
        </Body>
      </PreviewBox>
    </div>
  );
}
