import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      richColors={true}
      closeButton={true}
      duration={4000}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "hsl(142, 76%, 36%)",
          "--success-text": "hsl(355, 7%, 97%)",
          "--success-border": "hsl(142, 76%, 36%)",
          "--error-bg": "hsl(0, 84%, 60%)",
          "--error-text": "hsl(355, 7%, 97%)",
          "--error-border": "hsl(0, 84%, 60%)",
          "--warning-bg": "hsl(38, 92%, 50%)",
          "--warning-text": "hsl(355, 7%, 97%)",
          "--warning-border": "hsl(38, 92%, 50%)",
          "--info-bg": "hsl(221, 83%, 53%)",
          "--info-text": "hsl(355, 7%, 97%)",
          "--info-border": "hsl(221, 83%, 53%)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
