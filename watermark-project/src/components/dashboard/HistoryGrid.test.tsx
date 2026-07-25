import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import type { HistoryItem } from "../../types/watermark";
import { HistoryGrid } from "./HistoryGrid";

function makeItem(overrides: Partial<HistoryItem> = {}): HistoryItem {
  return {
    id: "item-1",
    thumbnailUrl: "/uploads/thumbnails/abc.jpg",
    createdAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("HistoryGrid", () => {
  it("shows the empty state when there are no items", () => {
    render(
      <MemoryRouter>
        <HistoryGrid items={[]} onDelete={vi.fn()} />
      </MemoryRouter>,
    );

    expect(screen.getByText("No history yet")).toBeInTheDocument();
  });

  it("calls onDelete with the item id when Delete is clicked", async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <HistoryGrid items={[makeItem()]} onDelete={onDelete} />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalledWith("item-1");
  });

  it("only shows Load more when hasMore is true", () => {
    const { rerender } = render(
      <MemoryRouter>
        <HistoryGrid items={[makeItem()]} onDelete={vi.fn()} onLoadMore={vi.fn()} hasMore={false} />
      </MemoryRouter>,
    );
    expect(screen.queryByRole("button", { name: "Load more" })).not.toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <HistoryGrid items={[makeItem()]} onDelete={vi.fn()} onLoadMore={vi.fn()} hasMore={true} />
      </MemoryRouter>,
    );
    expect(screen.getByRole("button", { name: "Load more" })).toBeInTheDocument();
  });
});
