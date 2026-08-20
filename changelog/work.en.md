# Host Feedback

## Logging and feedback

Browser failures now use Cognis' `ui:log` capability, transient notices use `ui:showToast`, and fatal page-mount failures open the host error-report popup through `ui:openErrorPopup`. Server fallbacks now use the module-scoped `ctx.log` function.
