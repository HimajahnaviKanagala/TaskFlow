import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import { getInitials } from "../utils/helpers";
import supabase from "../services/supabase";

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const name = user?.user_metadata?.full_name || "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { full_name: name, email: user?.email || "" },
  });

  const {
    register: regPw,
    handleSubmit: handlePwSubmit,
    reset: resetPw,
    formState: { errors: pwErrors },
  } = useForm();

  const onSaveProfile = async ({ full_name }) => {
    setSaving(true);
    try {
      await updateProfile({ full_name });
      await supabase.auth.updateUser({ data: { full_name } });
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async ({ password, confirm }) => {
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setChangingPw(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated!");
      resetPw();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Settings</h1>

      <div className="bg-white dark:bg-gray-800 dark:border dark:border-gray-600 rounded-xl p-6 mb-5">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-700 text-lg font-semibold">
              {getInitials(name || user?.email)}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-800 dark:text-gray-100">
              {name || "Set your name"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
          </div>
        </div>

        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-400 mb-4">
          Profile information
        </h2>
        <form
          onSubmit={handleSubmit(onSaveProfile)}
          className="flex flex-col gap-3"
        >
          <Input
            label="Full name"
            error={errors.full_name?.message}
            {...register("full_name", { required: "Name is required" })}
          />
          <Input
            label="Email"
            disabled
            value={user?.email || ""}
            className="bg-gray-50"
          />
          <Button type="submit" loading={saving} className="self-end">
            Save changes
          </Button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 dark:border dark:border-gray-600 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-400 mb-4">
          Change password
        </h2>
        <form
          onSubmit={handlePwSubmit(onChangePassword)}
          className="flex flex-col gap-3"
        >
          <Input
            label="New password"
            type="password"
            placeholder="Min 6 characters"
            error={pwErrors.password?.message}
            {...regPw("password", {
              required: "Password is required",
              minLength: { value: 6, message: "Min 6 characters" },
            })}
          />
          <Input
            label="Confirm password"
            type="password"
            placeholder="Re-enter new password"
            error={pwErrors.confirm?.message}
            {...regPw("confirm", { required: "Please confirm your password" })}
          />
          <Button type="submit" loading={changingPw} className="self-end">
            Update password
          </Button>
        </form>
      </div>
    </div>
  );
}
