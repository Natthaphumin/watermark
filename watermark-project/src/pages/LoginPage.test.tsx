import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../lib/apiClient";
import { LoginPage } from "./LoginPage";

const navigateMock = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => navigateMock };
});

const loginMock = vi.fn();
vi.mock("../hooks/useAuth", () => ({
  useAuth: () => ({ login: loginMock }),
}));

beforeEach(() => {
  navigateMock.mockClear();
  loginMock.mockClear();
});

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
}

describe("LoginPage", () => {
  it("submits the typed email/password and navigates to the dashboard on success", async () => {
    loginMock.mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText("Email"), "alice@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => expect(loginMock).toHaveBeenCalledWith("alice@example.com", "password123"));
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith("/dashboard"));
  });

  it("shows the API error message and does not navigate on failure", async () => {
    loginMock.mockRejectedValueOnce(new ApiError(401, "Invalid email or password"));
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText("Email"), "alice@example.com");
    await user.type(screen.getByLabelText("Password"), "wrong");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByText("Invalid email or password")).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
