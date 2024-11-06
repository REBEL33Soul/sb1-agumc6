import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-gray-900 to-gray-800">
      <div className="relative w-full max-w-md">
        <div className="absolute inset-0 bg-blue-500/20 blur-3xl" />
        <SignIn
          appearance={{
            elements: {
              rootBox: "relative z-10",
              card: "bg-gray-900/80 backdrop-blur-xl border border-gray-800",
              headerTitle: "text-white",
              headerSubtitle: "text-gray-400",
              socialButtonsBlockButton: "bg-gray-800 border border-gray-700 hover:bg-gray-700",
              formButtonPrimary: "bg-blue-600 hover:bg-blue-500",
              footerActionLink: "text-blue-400 hover:text-blue-300",
            },
          }}
        />
      </div>
    </div>
  );
}