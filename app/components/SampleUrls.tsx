import { ExampleDoc } from "./ExampleDoc";
import { useTranslation } from "react-i18next";

export function SampleUrls() {
  const { t } = useTranslation();
  return (
    <div className="flex justify-start flex-wrap gap-2">
      <ExampleDoc
        id="d9udW60cLOok"
        title={t("sampleUrls.tweetJson")}
        path="data.0.entities.urls.0.expanded_url"
      />
      <ExampleDoc id="PjHo1o5MVeH4" title={t("sampleUrls.githubApi")} />
      <ExampleDoc
        id="XKqIsPgCssUN"
        title={t("sampleUrls.airtableApi")}
        path="records.3.createdTime"
      />
      <ExampleDoc
        id="bSc7r1Ta0fED"
        title={t("sampleUrls.unsplashApi")}
        path="4.urls.regular"
      />
    </div>
  );
}
