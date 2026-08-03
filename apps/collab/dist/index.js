"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.docStore = void 0;
const server_1 = require("@hocuspocus/server");
const extension_database_1 = require("@hocuspocus/extension-database");
// In-memory snapshot persistence store (persists across reconnects/intervals, replaced by Postgres in Phase 12)
exports.docStore = new Map();
exports.server = new server_1.Server({
    port: Number(process.env.HOCUSPOCUS_PORT || 1234),
    extensions: [
        new extension_database_1.Database({
            fetch: async ({ documentName }) => {
                return exports.docStore.get(documentName) || null;
            },
            store: async ({ documentName, state }) => {
                exports.docStore.set(documentName, state);
            },
        }),
    ],
});
if (process.env.NODE_ENV !== 'test') {
    exports.server.listen().then(() => {
        console.log(`Hocuspocus Collab Server running on port ${process.env.HOCUSPOCUS_PORT || 1234}`);
    });
}
//# sourceMappingURL=index.js.map