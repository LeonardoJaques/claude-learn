"use client";

import { Loader2 } from "lucide-react";

type StrReplaceArgs = {
  command: "view" | "create" | "str_replace" | "insert" | "undo_edit";
  path: string;
};

type FileManagerArgs = {
  command: "rename" | "delete";
  path: string;
  new_path?: string;
};

type ToolArgs = StrReplaceArgs | FileManagerArgs | Record<string, unknown>;

function getLabel(toolName: string, args: ToolArgs): string {
  const fileName = (args as { path?: string }).path?.split("/").pop() ?? "";

  if (toolName === "str_replace_editor") {
    const { command } = args as StrReplaceArgs;
    switch (command) {
      case "create":
        return `Creating ${fileName}`;
      case "str_replace":
        return `Editing ${fileName}`;
      case "insert":
        return `Inserting into ${fileName}`;
      case "view":
        return `Reading ${fileName}`;
      default:
        return `Updating ${fileName}`;
    }
  }

  if (toolName === "file_manager") {
    const { command, new_path } = args as FileManagerArgs;
    switch (command) {
      case "delete":
        return `Deleting ${fileName}`;
      case "rename":
        return `Renaming ${fileName} → ${new_path?.split("/").pop() ?? ""}`;
      default:
        return `Managing ${fileName}`;
    }
  }

  return toolName;
}

interface ToolInvocationBadgeProps {
  toolName: string;
  args: ToolArgs;
  state: "call" | "partial-call" | "result";
}

export function ToolInvocationBadge({
  toolName,
  args,
  state,
}: ToolInvocationBadgeProps) {
  const isDone = state === "result";
  const label = getLabel(toolName, args);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
