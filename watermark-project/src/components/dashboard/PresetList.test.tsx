import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Preset } from "../../types/watermark";
import { PresetList } from "./PresetList";

const navigateMock = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => navigateMock };
});

beforeEach(() => {
  navigateMock.mockClear();
});

function makePreset(overrides: Partial<Preset> = {}): Preset {
  return {
    id: "preset-1",
    name: "My preset",
    textContent: "hello",
    textFont: null,
    textColor: null,
    textSize: null,
    textOpacity: null,
    textRotation: null,
    textPositionX: null,
    textPositionY: null,
    logoId: null,
    logoScale: null,
    logoOpacity: null,
    logoPositionX: null,
    logoPositionY: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("PresetList", () => {
  it("shows the empty state with a CTA when there are no presets", () => {
    render(
      <MemoryRouter>
        <PresetList presets={[]} onDelete={vi.fn()} />
      </MemoryRouter>,
    );

    expect(screen.getByText("No presets yet")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open the editor/i })).toHaveAttribute(
      "href",
      "/editor",
    );
  });

  it("navigates to the editor with the preset id when Load is clicked", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <PresetList presets={[makePreset()]} onDelete={vi.fn()} />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "Load" }));

    expect(navigateMock).toHaveBeenCalledWith("/editor", { state: { presetId: "preset-1" } });
  });

  it("calls onDelete with the preset id when Delete is clicked", async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <PresetList presets={[makePreset()]} onDelete={onDelete} />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(onDelete).toHaveBeenCalledWith("preset-1");
  });
});
