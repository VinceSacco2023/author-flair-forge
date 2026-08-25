// Netlify Functions v2 uses the same Web Request/Response signature, so the
// Vercel handler works here unchanged.
import handler from "../../api/send-report";

export default handler;

export const config = { path: "/api/send-report" };
