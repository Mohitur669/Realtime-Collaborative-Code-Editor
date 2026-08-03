"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.docStore = void 0;
const HocuspocusServerModule = __importStar(require("@hocuspocus/server"));
const extension_database_1 = require("@hocuspocus/extension-database");
const mod = HocuspocusServerModule;
const HocuspocusClass = mod.Hocuspocus || mod.default?.Hocuspocus || mod.Server?.constructor;
// In-memory snapshot persistence store (persists across reconnects/intervals, replaced by Postgres in Phase 12)
exports.docStore = new Map();
exports.server = new HocuspocusClass({
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
    const port = Number(process.env.HOCUSPOCUS_PORT || 1234);
    exports.server.listen(port).then(() => {
        console.log(`Hocuspocus Collab Server running on port ${port}`);
    });
}
//# sourceMappingURL=index.js.map