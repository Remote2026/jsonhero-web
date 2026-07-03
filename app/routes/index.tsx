import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Header } from "~/components/Header";
import { Footer } from "~/components/Footer";
import { NewDocumentPanel } from "~/components/NewDocumentPanel";
import { JsonDocProvider } from "~/hooks/useJsonDoc";
import { JsonProvider } from "~/hooks/useJson";
import { JsonSchemaProvider } from "~/hooks/useJsonSchema";
import { JsonColumnViewProvider } from "~/hooks/useJsonColumnView";
import { JsonSearchProvider } from "~/hooks/useJsonSearch";
import { JsonTreeViewProvider } from "~/hooks/useJsonTree";
import { JsonView } from "~/components/JsonView";
import { JsonColumnView } from "~/components/JsonColumnView";
import { InfoPanel } from "~/components/InfoPanel";
import Resizable from "~/components/Resizable";
import { sampleJson } from "~/samples/default";
import {
  TemplateIcon,
  CodeIcon,
  DownloadIcon,
} from "@heroicons/react/outline";
import { TreeIcon } from "~/components/Icons/TreeIcon";

export default function Index() {
  const { t } = useTranslation();
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const sampleDoc = useMemo(() => ({
    id: "_sample",
    title: t("sampleDoc.title"),
    readOnly: true,
    type: "raw" as const,
    contents: JSON.stringify(sampleJson),
  }), [t]);

  return (
    <div className="h-screen flex flex-col sm:overflow-hidden">
      <Header onNewDocument={() => setIsPanelOpen(true)} />

      {/* Sample doc notice */}
      <div className="flex items-center justify-center gap-2 py-1.5 px-4 bg-slate-100 border-b border-slate-300 dark:bg-slate-800 dark:border-slate-700">
        <span className="text-xs text-color-white
         tracking-wide text-slate-500 dark:text-slate-400">
          {t("sampleDoc.notice")}
        </span>
      </div>

      <JsonDocProvider doc={sampleDoc} key={sampleDoc.id}>
        <JsonProvider initialJson={sampleJson}>
          <JsonSchemaProvider>
            <JsonColumnViewProvider>
              <JsonSearchProvider>
                <JsonTreeViewProvider overscan={25}>
                  <div className="bg-slate-50 flex-grow transition dark:bg-slate-900 overflow-y-auto">
                    <div className="main-container flex justify-items-stretch h-full">
                      {/* Disabled sidebar icons for sample doc (avoid broken links to /j/_sample) */}
                      <div className="side-bar flex flex-col align-center justify-between h-full p-1 bg-slate-200 transition dark:bg-slate-800">
                        <ol className="relative">
                          <li className="relative w-10 h-10 mb-1 text-slate-400 dark:text-slate-600 rounded-sm flex items-center justify-center">
                            <TemplateIcon className="p-2 w-full h-full" />
                          </li>
                          <li className="relative w-10 h-10 mb-1 text-slate-400 dark:text-slate-600 rounded-sm flex items-center justify-center">
                            <CodeIcon className="p-2 w-full h-full" />
                          </li>
                          <li className="relative w-10 h-10 mb-1 text-slate-400 dark:text-slate-600 rounded-sm flex items-center justify-center">
                            <TreeIcon className="p-2 w-full h-full" />
                          </li>
                        </ol>
                        <ol>
                          <li className="relative w-10 h-10 mb-1 text-slate-400 dark:text-slate-600 rounded-sm flex items-center justify-center">
                            <DownloadIcon className="p-2 w-full h-full" />
                          </li>
                        </ol>
                      </div>
                      <JsonView>
                        <JsonColumnView />
                      </JsonView>
                      <Resizable
                        isHorizontal={true}
                        initialSize={500}
                        minimumSize={280}
                        maximumSize={900}
                      >
                        <div className="info-panel flex-grow h-full">
                          <InfoPanel />
                        </div>
                      </Resizable>
                    </div>
                  </div>
                </JsonTreeViewProvider>
              </JsonSearchProvider>
            </JsonColumnViewProvider>
          </JsonSchemaProvider>
        </JsonProvider>
      </JsonDocProvider>

      <Footer />
      <NewDocumentPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </div>
  );
}
