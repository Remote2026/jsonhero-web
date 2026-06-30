import { ShareIcon, PlusIcon, TrashIcon } from "@heroicons/react/outline";
import { DocumentTitle } from "./DocumentTitle";
import { DiscordIconTransparent } from "./Icons/DiscordIconTransparent";
import { EmailIconTransparent } from "./Icons/EmailIconTransparent";
import { GithubStar } from "./UI/GithubStar";
import { Logo } from "./Icons/Logo";
import { Share } from "./Share";
import { NewDocument } from "./NewDocument";
import {
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
} from "./UI/Popover";
import { Form } from "remix";
import { useJsonDoc } from "~/hooks/useJsonDoc";
import { LogoTriggerdotdev } from "./Icons/LogoTriggerdotdev";
import type { JSONDocument } from "~/jsonDoc.server";
import { useTranslation } from "react-i18next";

type HeaderProps = {
  onNewDocument?: () => void;
};

export function Header({ onNewDocument }: HeaderProps) {
  let doc: JSONDocument | undefined;
  try {
    doc = useJsonDoc().doc;
  } catch {
    // No JsonDocProvider available (e.g., index page)
  }
  const { t } = useTranslation();

  return (
    <header className="flex items-center justify-between w-screen h-[40px] bg-indigo-700 dark:bg-slate-800 border-b-[1px] border-slate-600">
      <div className="flex pl-2 gap-1 sm:gap-1.5 pt-0.5 h-8 justify-center items-center">
        <div className="w-20 sm:w-24">
          <Logo />
        </div>
        <p className="text-slate-300 text-sm font-sans">{t("header.by")}</p>
        <LogoTriggerdotdev className="w-16 sm:w-20 opacity-80 hover:opacity-100  transition duration-300" />
      </div>
      {doc && <DocumentTitle />}
      <ol className="flex text-sm items-center gap-2 px-4">
        {doc && !doc.readOnly && (
          <Form
            method="delete"
            onSubmit={(e) =>
              !confirm(t("header.deleteConfirm")) && e.preventDefault()
            }
          >
            <button type="submit">
              <button className="flex items-center justify-center py-1 bg-slate-200 text-slate-800 bg-opacity-80 text-base font-bold px-2 rounded uppercase hover:cursor-pointer hover:bg-opacity-100 transition">
                <TrashIcon className="w-4 h-4 mr-0.5"></TrashIcon>
                {t("header.delete")}
              </button>
            </button>
          </Form>
        )}

        {onNewDocument ? (
          <button
            onClick={onNewDocument}
            className="flex items-center justify-center bg-lime-500 text-slate-800 bg-opacity-90 text-base font-bold px-2 py-1 rounded uppercase hover:cursor-pointer hover:bg-opacity-100 transition"
          >
            <PlusIcon className="w-4 h-4 mr-0.5" />
            {t("header.new")}
          </button>
        ) : (
          <Popover>
            <PopoverTrigger>
              <button className="flex items-center justify-center bg-lime-500 text-slate-800 bg-opacity-90 text-base font-bold px-2 py-1 rounded uppercase hover:cursor-pointer hover:bg-opacity-100 transition">
                <PlusIcon className="w-4 h-4 mr-0.5" />
                New
              </button>
            </PopoverTrigger>
            <PopoverContent side="bottom" sideOffset={8}>
              <NewDocument />
              <PopoverArrow
                className="fill-current text-indigo-700"
                offset={20}
              />
            </PopoverContent>
          </Popover>
        )}

        {doc && (
          <Popover>
            <PopoverTrigger>
              <button className="flex items-center justify-center py-1 bg-slate-200 text-slate-800 bg-opacity-90 text-base font-bold px-2 rounded uppercase hover:cursor-pointer hover:bg-opacity-100 transition">
                <ShareIcon className="w-4 h-4 mr-1"></ShareIcon>
                {t("header.share")}
              </button>
            </PopoverTrigger>
            <PopoverContent side="bottom" sideOffset={8}>
              <Share />
              <PopoverArrow
                className="fill-current text-indigo-700"
                offset={20}
              />
            </PopoverContent>
          </Popover>
        )}

        <li className="opacity-90 transition hover:cursor-pointer hover:opacity-100">
          <GithubStar />
        </li>
        <li className="opacity-90 transition hover:cursor-pointer hover:opacity-100">
          <a href="https://discord.gg/JtBAxBr2m3" target="_blank">
            <DiscordIconTransparent />
          </a>
        </li>
      </ol>
    </header>
  );
}
