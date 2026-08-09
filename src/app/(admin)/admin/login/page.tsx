import {LoginForm} from "@/components/admin/login-form";

export const metadata = {title: "Sign in"};
export const dynamic = "force-dynamic";

export default async function AdminLoginPage({searchParams}: {searchParams: Promise<{next?: string}>}) {
    const params = await searchParams;
    const requestedPath = params.next;
    const nextPath = requestedPath?.startsWith("/admin/") && !requestedPath.startsWith("//") && !requestedPath.startsWith("/admin/login") ? requestedPath : "/admin/dashboard";
    return <LoginForm nextPath={nextPath}/>;
}
