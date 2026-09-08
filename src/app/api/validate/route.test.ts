import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "./route";

const { mockSearch, mockGenerateContent, mockAdd } = vi.hoisted(() => ({
  mockSearch: vi.fn(),
  mockGenerateContent: vi.fn(),
  mockAdd: vi.fn().mockResolvedValue({ id: "mock-doc-id" }),
}));

// Mock dependencies
vi.mock("@/lib/firebase-admin", () => ({
  firestore: {
    collection: vi.fn().mockReturnValue({
      add: mockAdd,
    }),
  },
}));

vi.mock("@tavily/core", () => ({
  tavily: vi.fn().mockReturnValue({
    search: mockSearch,
  }),
}));

vi.mock("@google/generative-ai", () => {
  return {
    GoogleGenerativeAI: class {
      getGenerativeModel() {
        return {
          generateContent: mockGenerateContent,
        };
      }
    },
  };
});

describe("POST /api/validate", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.useRealTimers();
  });

  it("returns 400 if idea is missing", async () => {
    const request = new Request("http://localhost:3000/api/validate", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Idea is required" });
  });

  it("returns mock response if API keys are missing", async () => {
    delete process.env.TAVILY_API_KEY;
    delete process.env.GEMINI_API_KEY;

    vi.useFakeTimers();
    const request = new Request("http://localhost:3000/api/validate", {
      method: "POST",
      body: JSON.stringify({ idea: "Uber for dog walking" }),
    });

    const promise = POST(request);
    await vi.advanceTimersByTimeAsync(4000);
    const response = await promise;
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.uniquenessScore).toBe(5);
    expect(data.pivot).toContain("mock mode");
  });

  it("successfully analyzes idea with Tavily and Gemini", async () => {
    process.env.TAVILY_API_KEY = "test-tavily-key";
    process.env.GEMINI_API_KEY = "test-gemini-key";

    mockSearch.mockResolvedValue({
      results: [
        { title: "Competitor 1", content: "Some info", url: "https://comp1.com" },
      ],
    });

    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            uniquenessScore: 8,
            pivot: "Pivot to AI drones",
            weekendStack: ["Next.js", "Tailwind", "Python"],
          }),
      },
    });

    const request = new Request("http://localhost:3000/api/validate", {
      method: "POST",
      body: JSON.stringify({ idea: "Drone delivery for coffee" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.uniquenessScore).toBe(8);
    expect(data.pivot).toBe("Pivot to AI drones");
    expect(data.sources).toHaveLength(1);
    expect(data.sources[0].title).toBe("Competitor 1");
    expect(mockAdd).toHaveBeenCalled();
  });

  it("strips markdown code blocks from Gemini response", async () => {
    process.env.TAVILY_API_KEY = "test-tavily-key";
    process.env.GEMINI_API_KEY = "test-gemini-key";

    mockSearch.mockResolvedValue({ results: [] });
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          "```json\n" +
          JSON.stringify({
            uniquenessScore: 9,
            pivot: "Autonomous barista bots",
            weekendStack: ["React", "FastAPI"],
          }) +
          "\n```",
      },
    });

    const request = new Request("http://localhost:3000/api/validate", {
      method: "POST",
      body: JSON.stringify({ idea: "Robo cafe" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.uniquenessScore).toBe(9);
    expect(data.pivot).toBe("Autonomous barista bots");
  });

  it("handles Gemini response parse failure gracefully", async () => {
    process.env.TAVILY_API_KEY = "test-tavily-key";
    process.env.GEMINI_API_KEY = "test-gemini-key";

    mockSearch.mockResolvedValue({ results: [] });
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => "Not valid JSON at all",
      },
    });

    const request = new Request("http://localhost:3000/api/validate", {
      method: "POST",
      body: JSON.stringify({ idea: "Bad AI output idea" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to parse AI response");
  });

  it("handles Tavily search error and falls back gracefully", async () => {
    process.env.TAVILY_API_KEY = "test-tavily-key";
    process.env.GEMINI_API_KEY = "test-gemini-key";

    mockSearch.mockRejectedValue(new Error("Network error"));
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            uniquenessScore: 4,
            pivot: "Better marketing",
            weekendStack: ["Next.js"],
          }),
      },
    });

    const request = new Request("http://localhost:3000/api/validate", {
      method: "POST",
      body: JSON.stringify({ idea: "Some idea" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.uniquenessScore).toBe(4);
  });

  it("handles general unexpected errors with status 500", async () => {
    const request = {
      json: vi.fn().mockRejectedValue(new Error("Corrupted payload")),
    } as unknown as Request;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal Server Error");
  });
});
