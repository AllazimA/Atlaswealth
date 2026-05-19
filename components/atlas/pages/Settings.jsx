import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, User, Shield } from "lucide-react";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleSave = async () => {
    await base44.auth.updateMe({
      full_name: user.full_name,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account preferences</p>
      </div>

      <Card className="border-gray-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" /> Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs text-gray-500">Full Name</Label>
            <Input
              value={user.full_name || ""}
              onChange={(e) => setUser({ ...user, full_name: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-500">Email</Label>
            <Input value={user.email || ""} readOnly className="mt-1 bg-gray-50" />
          </div>
          <div>
            <Label className="text-xs text-gray-500">Role</Label>
            <Input value={user.role || "admin"} readOnly className="mt-1 bg-gray-50 capitalize" />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button onClick={handleSave} className="bg-blue-700 hover:bg-blue-800">Save Changes</Button>
            {saved && (
              <span className="text-sm text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Saved
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" /> Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Password and security settings are managed through the platform authentication system.
          </p>
          <Button
            variant="outline"
            className="mt-3"
            onClick={() => base44.auth.logout()}
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}