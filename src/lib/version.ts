import pkg from "../../package.json" with { type: "json" };

/** The server's name as clients see it. Clients add it as the tool prefix, so tools need none (DESIGN.md 3g). */
export const SERVER_NAME = "lula";

/** Semver for the server (DESIGN.md 9c), read from package.json so there is one source. */
export const SERVER_VERSION: string = pkg.version;
