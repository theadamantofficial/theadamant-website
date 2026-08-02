import {readFile, writeFile} from "node:fs/promises";
import path from "node:path";
import {loadEnvConfig} from "@next/env";
import {reconcileRecoveredBlogPosts} from "@/lib/blog-recovery";
import {parseStoredBlogPosts} from "@/lib/blog-post-record";
import {listSupabaseBlogPosts, upsertSupabaseBlogPosts} from "@/lib/supabase-blog";

interface ImportArguments {
    sourcePath: string;
    apply: boolean;
    backupPath: string;
}

loadEnvConfig(process.cwd());

async function main() {
    const options = parseArguments(process.argv.slice(2));
    const raw = await readFile(options.sourcePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    const sourceCount = Array.isArray(parsed) ? parsed.length : 0;
    const recoveredPosts = parseStoredBlogPosts(raw);
    const currentPosts = await listSupabaseBlogPosts();
    const {posts, report} = reconcileRecoveredBlogPosts(currentPosts, recoveredPosts);
    const summary = {
        mode: options.apply ? "apply" : "dry-run",
        sourcePath: options.sourcePath,
        sourceCount,
        invalidCount: Math.max(0, sourceCount - recoveredPosts.length),
        ...report,
    };

    console.log(JSON.stringify(summary, null, 2));

    if (!options.apply) {
        console.log("Dry-run complete. Re-run with --apply and --backup=/secure/path/current-supabase-posts.json.");
        return;
    }

    if (!options.backupPath) {
        throw new Error("--backup=/absolute/path/current-supabase-posts.json is required with --apply.");
    }

    await writeFile(options.backupPath, `${JSON.stringify(currentPosts, null, 2)}\n`, {flag: "wx"});

    const renamedIds = new Set(report.renamedCurrentSlugs.map((entry) => entry.id));
    const renamedCurrentPosts = posts.filter((post) => renamedIds.has(post.id));

    if (renamedCurrentPosts.length > 0) {
        await upsertSupabaseBlogPosts(renamedCurrentPosts);
    }

    await upsertSupabaseBlogPosts(posts);

    const finalPosts = await listSupabaseBlogPosts();
    if (finalPosts.length !== report.finalCount) {
        throw new Error(`Recovery verification failed: expected ${report.finalCount} rows, found ${finalPosts.length}.`);
    }

    console.log(JSON.stringify({
        applied: true,
        backupPath: options.backupPath,
        verifiedFinalCount: finalPosts.length,
    }, null, 2));
}

function parseArguments(args: string[]): ImportArguments {
    const sourceArgument = args.find((argument) => !argument.startsWith("--"));
    const backupArgument = args.find((argument) => argument.startsWith("--backup="));

    if (!sourceArgument) {
        throw new Error(
            "Usage: npm run blog:import -- /path/internal-blog-posts.json [--apply --backup=/absolute/path/backup.json]",
        );
    }

    const sourcePath = path.resolve(sourceArgument);
    const backupPath = backupArgument ? path.resolve(backupArgument.slice("--backup=".length)) : "";

    return {
        sourcePath,
        apply: args.includes("--apply"),
        backupPath,
    };
}

main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
