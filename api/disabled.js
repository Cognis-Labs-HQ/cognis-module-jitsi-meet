import { registerJitsiConfigurationApi } from "./reuse/configuration-api.js";

export function registerDisabledApiRoutes(ctx) {
    registerJitsiConfigurationApi(ctx.router, ctx);
}
