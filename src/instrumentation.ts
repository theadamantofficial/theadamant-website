import type {Instrumentation} from "next";

export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
    // Reporting infrastructure must not recursively report its own failures.
    if (request.path.split("?")[0] === "/api/telemetry/crash") return;
    const [{createCrashReport}, {notifyDiscordCrash}] = await Promise.all([
        import("@/lib/telemetry/report"), import("@/lib/telemetry/discord.server"),
    ]);
    await notifyDiscordCrash(createCrashReport(error, "server", context.routePath || request.path));
};
