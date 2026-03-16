import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ToolInvocationBadge } from "../ToolInvocationBadge";

describe("ToolInvocationBadge", () => {
  describe("str_replace_editor", () => {
    it("shows 'Creating <file>' for create command", () => {
      render(
        <ToolInvocationBadge
          toolName="str_replace_editor"
          args={{ command: "create", path: "src/components/Button.tsx" }}
          state="call"
        />
      );
      expect(screen.getByText("Creating Button.tsx")).toBeDefined();
    });

    it("shows 'Editing <file>' for str_replace command", () => {
      render(
        <ToolInvocationBadge
          toolName="str_replace_editor"
          args={{ command: "str_replace", path: "src/App.tsx" }}
          state="call"
        />
      );
      expect(screen.getByText("Editing App.tsx")).toBeDefined();
    });

    it("shows 'Inserting into <file>' for insert command", () => {
      render(
        <ToolInvocationBadge
          toolName="str_replace_editor"
          args={{ command: "insert", path: "src/index.ts" }}
          state="call"
        />
      );
      expect(screen.getByText("Inserting into index.ts")).toBeDefined();
    });

    it("shows 'Reading <file>' for view command", () => {
      render(
        <ToolInvocationBadge
          toolName="str_replace_editor"
          args={{ command: "view", path: "src/utils.ts" }}
          state="call"
        />
      );
      expect(screen.getByText("Reading utils.ts")).toBeDefined();
    });
  });

  describe("file_manager", () => {
    it("shows 'Deleting <file>' for delete command", () => {
      render(
        <ToolInvocationBadge
          toolName="file_manager"
          args={{ command: "delete", path: "src/old.tsx" }}
          state="call"
        />
      );
      expect(screen.getByText("Deleting old.tsx")).toBeDefined();
    });

    it("shows 'Renaming <file> → <new>' for rename command", () => {
      render(
        <ToolInvocationBadge
          toolName="file_manager"
          args={{ command: "rename", path: "src/Foo.tsx", new_path: "src/Bar.tsx" }}
          state="call"
        />
      );
      expect(screen.getByText("Renaming Foo.tsx → Bar.tsx")).toBeDefined();
    });
  });

  describe("state indicator", () => {
    it("shows spinner when not yet done", () => {
      const { container } = render(
        <ToolInvocationBadge
          toolName="str_replace_editor"
          args={{ command: "create", path: "src/Foo.tsx" }}
          state="call"
        />
      );
      expect(container.querySelector(".animate-spin")).toBeDefined();
    });

    it("shows green dot when result is ready", () => {
      const { container } = render(
        <ToolInvocationBadge
          toolName="str_replace_editor"
          args={{ command: "create", path: "src/Foo.tsx" }}
          state="result"
        />
      );
      expect(container.querySelector(".bg-emerald-500")).toBeDefined();
      expect(container.querySelector(".animate-spin")).toBeNull();
    });
  });
});
