import { clsx } from "clsx"; // This import is correct and should not cause the error.

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "muted" | "success";
};

export const Button = ({ variant = "primary", className, ...props }: Props) => {
  const variants = {
    primary: "bg-brand text-white hover:bg-brand-dark",
    secondary: "bg-white text-brand border border-brand hover:bg-brand-light",
    ghost: "bg-transparent text-brand hover:bg-brand/10",
    muted: "bg-muted text-white hover:bg-muted/80",
    success: "bg-success text-white hover:bg-green-700"
  };

  return (
    <button
      {...props}
      className={clsx(
        "px-4 py-2 rounded-xl font-semibold transition duration-200 focus:outline-none focus:ring-2",
        variants[variant],
        className
      )}
    />
  );
};
