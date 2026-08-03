"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const room_gateway_1 = require("./room.gateway");
const livekit_controller_1 = require("./livekit.controller");
const recordings_controller_1 = require("./recordings.controller");
const ai_controller_1 = require("./ai.controller");
const persistence_controller_1 = require("./persistence.controller");
const auth_controller_1 = require("./auth.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [
            app_controller_1.AppController,
            livekit_controller_1.LiveKitController,
            recordings_controller_1.RecordingsController,
            ai_controller_1.AiController,
            persistence_controller_1.PersistenceController,
            auth_controller_1.AuthController,
        ],
        providers: [room_gateway_1.RoomGateway],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map