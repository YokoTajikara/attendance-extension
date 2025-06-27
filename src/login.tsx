import { createRoot } from "react-dom/client";
import { Auth } from "./lib/components/Auth";

createRoot(document.getElementById("root")!).render(<Auth isPopup={false} />); 