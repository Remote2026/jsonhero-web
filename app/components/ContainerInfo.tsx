import { inferType } from "@jsonhero/json-infer-types";
import { JSONHeroPath } from "@jsonhero/path";
import { useJson } from "~/hooks/useJson";
import { useJsonColumnViewState } from "~/hooks/useJsonColumnView";
import { pathToDescendant } from "~/utilities/jsonColumnView";
import { JsonPreview } from "./JsonPreview";
import { JsonSchemaViewer } from "./JsonSchemaViewer";
import { TabContent, Tabs } from "./UI/Tabs";
import { useTranslation } from "react-i18next";

export function ContainerInfo() {
  const { t } = useTranslation();
  const tabs = [
    { value: "json", label: t("containerInfo.json") },
    { value: "schema", label: t("containerInfo.schema") },
  ];
  const { selectedNodeId, highlightedNodeId } = useJsonColumnViewState();

  if (!selectedNodeId || !highlightedNodeId) {
    return <></>;
  }

  const [json] = useJson();

  const selectedHeroPath = new JSONHeroPath(selectedNodeId);
  const selectedJson = selectedHeroPath.first(json);
  const selectedInfo = inferType(selectedJson);

  const isSelectedLeafNode =
    selectedInfo.name !== "object" && selectedInfo.name !== "array";

  const highlightedHeroPath = new JSONHeroPath(highlightedNodeId);
  const highlightedJson = highlightedHeroPath.first(json);
  const highlightedInfo = inferType(highlightedJson);

  const isHighlightedLeafNode =
    highlightedInfo.name !== "object" && highlightedInfo.name !== "array";

  const shouldHighlightInPreview =
    selectedNodeId !== highlightedNodeId && !isHighlightedLeafNode;

  const shouldDisplayCodePreview =
    shouldHighlightInPreview || !isSelectedLeafNode;

  if (!shouldDisplayCodePreview) {
    return <></>;
  }

  return (
    <Tabs tabs={tabs}>
      <>
        <TabContent value="json">
          {shouldHighlightInPreview ? (
            <JsonPreview
              json={highlightedJson}
              highlightPath={pathToDescendant(
                highlightedNodeId,
                selectedNodeId
              )}
            />
          ) : (
            <JsonPreview json={selectedJson} />
          )}
        </TabContent>
        <TabContent value="schema">
          {shouldHighlightInPreview ? (
            <JsonSchemaViewer path={highlightedNodeId} />
          ) : (
            <JsonSchemaViewer path={selectedNodeId} />
          )}
        </TabContent>
      </>
    </Tabs>
  );
}
