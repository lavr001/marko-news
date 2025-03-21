import { render, screen } from "@marko/testing-library";
import { fireEvent } from "@testing-library/dom";
import "@testing-library/jest-dom";
import NewsContent from "./news-content.marko";

describe("NewsContent Component", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("displays loading indicator while waiting for fetch", async () => {
    const pendingFetch = new Promise(() => {});
    jest.spyOn(global, "fetch").mockImplementation(() => pendingFetch);

    render(NewsContent);

    const loadingIndicator = await screen.findByText(/loading news/i);
    expect(loadingIndicator).toBeInTheDocument();
  });

  test("displays error message when fetch fails", async () => {
    jest.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Network error"));

    render(NewsContent);

    const errorMessage = await screen.findByText("Unable to fetch news at this time.");
    expect(errorMessage).toBeInTheDocument();
  });

  test("displays 'No news articles found.' when fetch returns an empty articles array", async () => {
    const fakeResponse = {
      status: "ok",
      articles: [],
    };
    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      json: () => Promise.resolve(fakeResponse),
    });

    render(NewsContent);

    const noNewsMessage = await screen.findByText(/no news articles found/i);
    expect(noNewsMessage).toBeInTheDocument();
  });

  test("displays article title when fetch returns articles", async () => {
    const fakeResponse = {
      status: "ok",
      articles: [
        {
          title: "Test Article",
          url: "#",
          urlToImage: "http://example.com/image.jpg",
          source: { name: "Test Source" },
          author: "Test Author",
          description: "Test Description",
          publishedAt: "2021-01-01",
        },
      ],
    };
    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      json: () => Promise.resolve(fakeResponse),
    });

    render(NewsContent);

    const articleTitle = await screen.findByText(/test article/i);
    expect(articleTitle).toBeInTheDocument();
  });

  test("has default search input value 'Apple'", async () => {
    jest.spyOn(global, "fetch").mockImplementation(() => new Promise(() => {}));

    render(NewsContent);

    const searchInput = await screen.findByPlaceholderText("Search news...");
    expect(searchInput).toHaveValue("Apple");
  });

  test("advances to next page when Next button is clicked", async () => {
    const fakeResponse = {
      status: "ok",
      articles: Array.from({ length: 12 }, (_, i) => ({
        title: `Article ${i + 1}`,
        url: "#",
        urlToImage: null,
        source: { name: "Test Source" },
        author: "Test Author",
        description: "Test Description",
        publishedAt: "2021-01-01",
      })),
    };
    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      json: () => Promise.resolve(fakeResponse),
    });

    render(NewsContent);

    const paginationText = await screen.findByText(/page 1 of 3/i);
    expect(paginationText).toBeInTheDocument();

    const nextButton = screen.getByRole("button", { name: /next/i });
    fireEvent.click(nextButton);

    const updatedPagination = await screen.findByText(/page 2 of 3/i);
    expect(updatedPagination).toBeInTheDocument();

    const articleTitle = await screen.findByText(/article 6/i);
    expect(articleTitle).toBeInTheDocument();
  });
});
