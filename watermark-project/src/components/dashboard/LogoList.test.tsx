import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import type { Logo } from "../../types/watermark";
import { LogoList } from "./LogoList";

function makeLogo(overrides: Partial<Logo> = {}): Logo {
  return {
    id: "logo-1",
    filename: "abc.png",
    originalName: "brand-logo.png",
    url: "/uploads/logos/abc.png",
    createdAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("LogoList", () => {
  it("shows the empty state when there are no logos", () => {
    render(
      <MemoryRouter>
        <LogoList logos={[]} onDelete={vi.fn()} />
      </MemoryRouter>,
    );

    expect(screen.getByText("No logos yet")).toBeInTheDocument();
  });

  it("renders each logo's name and calls onDelete with its id", async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <LogoList logos={[makeLogo()]} onDelete={onDelete} />
      </MemoryRouter>,
    );

    expect(screen.getByText("brand-logo.png")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalledWith("logo-1");
  });
});
