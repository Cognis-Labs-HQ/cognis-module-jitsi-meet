export function resolveCtxCapability(ctx, capabilityId) {
    const scopedCapability = ctx.capabilities?.get?.(capabilityId);
    if (scopedCapability !== undefined) return scopedCapability;
    return ctx.getCapability?.(capabilityId);
}
