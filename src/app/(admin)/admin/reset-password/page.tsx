import {PasswordResetForm} from "@/components/admin/password-reset-form";

export const metadata = {title: "Reset password"};
export const dynamic = "force-dynamic";

export default function AdminResetPasswordPage() {
    return <PasswordResetForm/>;
}
