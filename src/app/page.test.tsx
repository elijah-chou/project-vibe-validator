import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "./page";

describe("Home Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders initial shower thought textarea and disabled button", () => {
    render(<Home />);

    const textarea = screen.getByPlaceholderText(
      /Drop your messy shower thought here.../i
    );
    expect(textarea).toBeInTheDocument();

    const submitButton = screen.getByRole("button", { name: /VIBE CHECK/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it("enables the submit button when user types an idea", async () => {
    const user = userEvent.setup();
    render(<Home />);

    const textarea = screen.getByPlaceholderText(
      /Drop your messy shower thought here.../i
    );
    const submitButton = screen.getByRole("button", { name: /VIBE CHECK/i });

    await user.type(textarea, "Uber for cats");

    expect(textarea).toHaveValue("Uber for cats");
    expect(submitButton).not.toBeDisabled();
  });

  it("submits the idea, displays loading state, and renders vibe report", async () => {
    const user = userEvent.setup();
    const mockReport = {
      uniquenessScore: 7,
      pivot: "Feline logistics network",
      weekendStack: ["Next.js", "Tailwind", "Supabase"],
      sources: [{ title: "Cat App", url: "https://cat.app" }],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockReport,
    } as unknown as Response);

    render(<Home />);

    const textarea = screen.getByPlaceholderText(
      /Drop your messy shower thought here.../i
    );
    await user.type(textarea, "Uber for cats");

    const submitButton = screen.getByRole("button", { name: /VIBE CHECK/i });
    await user.click(submitButton);

    // Verify loading state appears
    expect(
      screen.getByText(/Thinking... parsing shower thoughts/i)
    ).toBeInTheDocument();

    // Verify report card renders
    await waitFor(
      () => {
        expect(screen.getByText(/The Vibe Report/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("Feline logistics network")).toBeInTheDocument();
    expect(screen.getByText("Next.js")).toBeInTheDocument();
    expect(screen.getByText("Cat App")).toBeInTheDocument();

    // Reset button
    const resetButton = screen.getByRole("button", {
      name: /Validate Another Vibe/i,
    });
    await user.click(resetButton);

    // Back to idle
    expect(
      screen.getByPlaceholderText(/Drop your messy shower thought here.../i)
    ).toBeInTheDocument();
  });

  it("handles fetch failure gracefully", async () => {
    const user = userEvent.setup();
    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Server went down" }),
    } as unknown as Response);

    render(<Home />);

    const textarea = screen.getByPlaceholderText(
      /Drop your messy shower thought here.../i
    );
    await user.type(textarea, "Failing idea");

    const submitButton = screen.getByRole("button", { name: /VIBE CHECK/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith("Server went down");
    });

    alertMock.mockRestore();
  });
});
