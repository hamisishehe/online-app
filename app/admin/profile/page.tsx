import { requireAdmin } from "@/lib/auth/current-user";
import { ProfileForms } from "@/components/profile-forms";

export default async function Page() {
  const user = await requireAdmin();

  return (
    <div className="grid gap-4">
      <h2 className="text-lg font-semibold">Profile</h2>
      <ProfileForms
        user={{
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
        }}
      />
    </div>
  );
}

