import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import DashboardLayout from "../layouts/DashboardLayout";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", password: "" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await api.put("/api/auth/profile", form, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      updateUser(response.data);
      setForm((current) => ({ ...current, password: "" }));
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-slate-800">Profile settings</h1>
        <p className="mt-2 text-slate-500">Manage your account details and password.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <label className="block text-sm font-semibold text-slate-700">Name
            <input className="mt-2 w-full rounded-xl border border-slate-200 p-3" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          </label>
          <label className="block text-sm font-semibold text-slate-700">Email
            <input type="email" className="mt-2 w-full rounded-xl border border-slate-200 p-3" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
          </label>
          <label className="block text-sm font-semibold text-slate-700">New password <span className="font-normal text-slate-400">(optional)</span>
            <input type="password" minLength="8" placeholder="Leave blank to keep your password" className="mt-2 w-full rounded-xl border border-slate-200 p-3" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          </label>
          <div className="flex gap-3">
            <button disabled={saving} className="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-white hover:bg-emerald-600 disabled:opacity-50">{saving ? "Saving..." : "Save changes"}</button>
            <button type="button" onClick={() => navigate(-1)} className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-600">Cancel</button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
