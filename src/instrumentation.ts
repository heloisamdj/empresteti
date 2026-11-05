export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.SENTRY_DSN) {
    const { init } = await import("@sentry/node");
    init({
      dsn: process.env.SENTRY_DSN,
      beforeSend(event) {
        event.user = undefined;
        if (event.request) {
          event.request.cookies = undefined;
          event.request.headers = undefined;
          event.request.data = undefined;
        }
        return event;
      },
      environment: process.env.NODE_ENV,
    });
  }
}
