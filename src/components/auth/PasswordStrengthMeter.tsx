import { motion } from "framer-motion";

export type PasswordStrength = "empty" | "weak" | "medium" | "strong";

export function evaluatePasswordStrength(password: string): PasswordStrength {
  if (!password) return "empty";
  if (password.length < 8) return "weak";
  
  let score = 0;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  
  if (score < 2) return "weak";
  if (score === 2 || score === 3) return "medium";
  return "strong";
}

interface Props {
  password?: string;
  strength?: PasswordStrength;
}

export function PasswordStrengthMeter({ password, strength: propStrength }: Props) {
  const strength = propStrength || evaluatePasswordStrength(password || "");
  
  if (strength === "empty") return null;

  const getColors = () => {
    switch (strength) {
      case "weak": return ["bg-red-500", "bg-slate-200 dark:bg-slate-700", "bg-slate-200 dark:bg-slate-700"];
      case "medium": return ["bg-yellow-500", "bg-yellow-500", "bg-slate-200 dark:bg-slate-700"];
      case "strong": return ["bg-green-500", "bg-green-500", "bg-green-500"];
      default: return ["bg-slate-200 dark:bg-slate-700", "bg-slate-200 dark:bg-slate-700", "bg-slate-200 dark:bg-slate-700"];
    }
  };

  const getLabel = () => {
    switch (strength) {
      case "weak": return "Weak (must be at least 8 chars & contain numbers/symbols)";
      case "medium": return "Medium";
      case "strong": return "Strong";
      default: return "";
    }
  };

  const colors = getColors();

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1 h-1.5 w-full">
        <motion.div initial={false} animate={{ backgroundColor: colors[0] }} className="h-full flex-1 rounded-full bg-slate-200 dark:bg-slate-700 transition-colors" />
        <motion.div initial={false} animate={{ backgroundColor: colors[1] }} className="h-full flex-1 rounded-full bg-slate-200 dark:bg-slate-700 transition-colors" />
        <motion.div initial={false} animate={{ backgroundColor: colors[2] }} className="h-full flex-1 rounded-full bg-slate-200 dark:bg-slate-700 transition-colors" />
      </div>
      <p className={`text-xs ${strength === "weak" ? "text-red-500" : strength === "medium" ? "text-yellow-600 dark:text-yellow-500" : "text-green-600 dark:text-green-500"}`}>
        {getLabel()}
      </p>
    </div>
  );
}
