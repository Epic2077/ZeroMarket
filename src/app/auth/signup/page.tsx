import { SignupForm } from "@/components/auth/signup-form";
import Logo from "@/components/shared/Logo";

export default function SignupPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10 mt-5">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex size-6 items-center justify-center rounded-md text-primary-foreground">
            <Logo size={"medium"} />
          </div>
          ZeroMarket
        </a>
        <SignupForm />
      </div>
    </div>
  );
}
