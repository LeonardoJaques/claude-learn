import { test, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MainContent } from "@/app/main-content";

// Mock providers
vi.mock("@/lib/contexts/file-system-context", () => ({
  FileSystemProvider: ({ children }: any) => <div>{children}</div>,
  useFileSystem: vi.fn(),
}));

vi.mock("@/lib/contexts/chat-context", () => ({
  ChatProvider: ({ children }: any) => <div>{children}</div>,
  useChat: vi.fn(),
}));

// Mock child components
vi.mock("@/components/chat/ChatInterface", () => ({
  ChatInterface: () => <div data-testid="chat-interface">ChatInterface</div>,
}));

vi.mock("@/components/editor/FileTree", () => ({
  FileTree: () => <div data-testid="file-tree">FileTree</div>,
}));

vi.mock("@/components/editor/CodeEditor", () => ({
  CodeEditor: () => <div data-testid="code-editor">CodeEditor</div>,
}));

vi.mock("@/components/preview/PreviewFrame", () => ({
  PreviewFrame: () => <div data-testid="preview-frame">PreviewFrame</div>,
}));

vi.mock("@/components/HeaderActions", () => ({
  HeaderActions: () => <div data-testid="header-actions">HeaderActions</div>,
}));

// Mock resizable components
vi.mock("@/components/ui/resizable", () => ({
  ResizablePanelGroup: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  ResizablePanel: ({ children }: any) => <div>{children}</div>,
  ResizableHandle: () => <div />,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

test("renders with Preview tab active by default", () => {
  render(<MainContent />);

  expect(screen.getByTestId("preview-frame")).toBeDefined();
  expect(screen.queryByTestId("code-editor")).toBeNull();
});

test("clicking Code tab shows code editor and hides preview", async () => {
  const user = userEvent.setup();
  render(<MainContent />);

  // Initially showing preview
  expect(screen.getByTestId("preview-frame")).toBeDefined();
  expect(screen.queryByTestId("code-editor")).toBeNull();

  // Click Code tab — userEvent fires mousedown which Radix Tabs listens to
  await user.click(screen.getByText("Code"));

  // Now showing code editor
  expect(screen.queryByTestId("preview-frame")).toBeNull();
  expect(screen.getByTestId("code-editor")).toBeDefined();
  expect(screen.getByTestId("file-tree")).toBeDefined();
});

test("clicking Preview tab after Code tab switches back to preview", async () => {
  const user = userEvent.setup();
  render(<MainContent />);

  // Switch to Code view
  await user.click(screen.getByText("Code"));
  expect(screen.queryByTestId("preview-frame")).toBeNull();
  expect(screen.getByTestId("code-editor")).toBeDefined();

  // Switch back to Preview
  await user.click(screen.getByText("Preview"));
  expect(screen.getByTestId("preview-frame")).toBeDefined();
  expect(screen.queryByTestId("code-editor")).toBeNull();
});

test("toggle buttons are rendered and clickable", () => {
  render(<MainContent />);

  const previewButton = screen.getByText("Preview");
  const codeButton = screen.getByText("Code");

  expect(previewButton).toBeDefined();
  expect(codeButton).toBeDefined();

  // Both buttons should be actual button elements
  expect(previewButton.closest("button")).not.toBeNull();
  expect(codeButton.closest("button")).not.toBeNull();
});

test("Preview button is active by default", () => {
  render(<MainContent />);

  const previewButton = screen.getByText("Preview").closest("button");
  expect(previewButton?.getAttribute("data-state")).toBe("active");

  const codeButton = screen.getByText("Code").closest("button");
  expect(codeButton?.getAttribute("data-state")).toBe("inactive");
});

test("Code button becomes active after clicking", async () => {
  const user = userEvent.setup();
  render(<MainContent />);

  await user.click(screen.getByText("Code"));

  const codeButton = screen.getByText("Code").closest("button");
  expect(codeButton?.getAttribute("data-state")).toBe("active");

  const previewButton = screen.getByText("Preview").closest("button");
  expect(previewButton?.getAttribute("data-state")).toBe("inactive");
});

test("tabs respond to mousedown (not just click)", () => {
  render(<MainContent />);

  // Radix Tabs triggers on mousedown — test via fireEvent.mouseDown
  const codeButton = screen.getByText("Code").closest("button")!;
  fireEvent.mouseDown(codeButton, { button: 0, ctrlKey: false });

  expect(screen.queryByTestId("preview-frame")).toBeNull();
  expect(screen.getByTestId("code-editor")).toBeDefined();
});
