import { useState } from "react";
import { Wrench, Shield, Eye, EyeOff, Sun, Moon } from "lucide-react";

interface User {
  id: string;
  name: string;
  role: "admin" | "technician";
  email: string;
  password: string;
  avatar: string;
}

interface LoginProps {
  onLogin: (user: User) => void;
  users: User[];
  darkMode: boolean;
  onToggleDark: () => void;
}

export function Login({ onLogin, users, darkMode, onToggleDark }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const user = users.find((u) => u.email === email && u.password === password);
    if (user) { setError(""); onLogin(user); }
    else setError("Invalid credentials. Please try again.");
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Theme toggle */}
      <button
        onClick={onToggleDark}
        className="fixed top-4 right-4 w-9 h-9 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
      >
        {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Wrench className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-foreground leading-none" style={{ fontWeight: 700, fontSize: "1.25rem" }}>FieldOps</p>
            <p className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>Task Management Platform</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-8">
          <h1 className="text-foreground mb-1" style={{ fontWeight: 600, fontSize: "1.375rem" }}>Sign in</h1>
          <p className="text-muted-foreground mb-8" style={{ fontSize: "0.875rem" }}>Enter your credentials to access the platform</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-foreground" style={{ fontSize: "0.875rem" }}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-foreground" style={{ fontSize: "0.875rem" }}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 pr-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-destructive" style={{ fontSize: "0.875rem" }}>{error}</p>}

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 hover:opacity-90 active:opacity-80 transition-opacity"
              style={{ fontWeight: 600 }}
            >
              Sign in
            </button>
          </form>

          <div className="mt-8 border-t border-border pt-6">
            <p className="text-muted-foreground mb-3" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Demo accounts</p>
            <div className="flex flex-col gap-2">
              {users.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => { setEmail(u.email); setPassword(u.password); }}
                  className="flex items-center gap-3 text-left px-3 py-2.5 rounded-lg bg-accent hover:bg-secondary transition-colors"
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${u.role === "admin" ? "bg-primary/20" : "bg-blue-500/20"}`}>
                    {u.role === "admin"
                      ? <Shield className="w-3.5 h-3.5 text-primary" />
                      : <Wrench className="w-3.5 h-3.5 text-blue-400" />}
                  </div>
                  <div>
                    <p className="text-foreground" style={{ fontSize: "0.8125rem", fontWeight: 500 }}>{u.name}</p>
                    <p className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>{u.email} · {u.role}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
