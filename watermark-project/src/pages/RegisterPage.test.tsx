import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../lib/apiClient";
import { RegisterPage } from "./RegisterPage";

const navigateMock = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => navigateMock };
});

const registerMock = vi.fn();
vi.mock("../hooks/useAuth", () => ({
  useAuth: () => ({ register: registerMock }),
}));

beforeEach(() => {
  navigateMock.mockClear();
  registerMock.mockClear();
});

function renderRegisterPage() {
  return render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>,
  );
}

describe("RegisterPage", () => {
  it("submits the typed email/password and navigates to the dashboard on success", async () => {
    registerMock.mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    renderRegisterPage();

    await user.type(screen.getByLabelText("Email"), "new@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() =>
      expect(registerMock).toHaveBeenCalledWith("new@example.com", "password123"),
    );
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith("/dashboard"));
  });

  it("shows the API error message (e.g. duplicate email) and does not navigate", async () => {
    registerMock.mockRejectedValueOnce(new ApiError(409, "Email already registered"));
    const user = userEvent.setup();
    renderRegisterPage();

    await user.type(screen.getByLabelText("Email"), "dup@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText("Email already registered")).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
