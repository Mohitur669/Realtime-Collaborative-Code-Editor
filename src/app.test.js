import { render, screen } from "@testing-library/react";
import App from "./app";

test("renders home brand", () => {
  render(<App />);
  expect(screen.getByText(/Code Sync/i)).toBeInTheDocument();
});
