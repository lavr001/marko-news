import { render, screen, waitFor } from "@marko/testing-library";
import { fireEvent } from "@testing-library/dom";
import "@testing-library/jest-dom";
import NewsContent from "./news-content.marko";

describe("NewsContent Component", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("updates search input value when user types", async () => {
    await render(NewsContent);
    const searchInput = screen.getByPlaceholderText("Search news...");

    fireEvent.input(searchInput, { target: { value: "Tesla" } });
    expect(searchInput).toHaveValue("Tesla");
  });

  test("has default search input value 'Apple'", async () => {
    jest.spyOn(global, "fetch").mockImplementation(() => new Promise(() => {}));
    render(NewsContent);

    const searchInput = await waitFor(() =>
      screen.getByPlaceholderText("Search news...")
    );
    expect(searchInput).toHaveValue("Apple");
  });

  test("updates per page select when changed", async () => {
    await render(NewsContent);

    const perPageSelect = screen.getByRole("combobox");
    expect(perPageSelect).toHaveValue("5");

    fireEvent.change(perPageSelect, { target: { value: "10" } });
    expect(perPageSelect).toHaveValue("10");
  });

  test("does not render pagination controls when articles array is empty", async () => {
    await render(NewsContent);

    const pagination = screen.queryByText(/page \d+ of \d+/i);
    expect(pagination).not.toBeInTheDocument();
  });

  test("does not render loading indicator when state.loading is false", async () => {
    await render(NewsContent, {
      state: {
        query: "Apple",
        loading: false,
        articles: [],
        error: null,
        currentPage: 1,
        perPage: 5,
      },
    });
    expect(screen.queryByText(/loading news/i)).not.toBeInTheDocument();
  });
});
