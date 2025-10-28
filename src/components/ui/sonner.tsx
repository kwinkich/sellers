import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      richColors={false}
      closeButton={false}
      duration={4000}
      toastOptions={{
        classNames: {
          title: "!font-medium !text-white",
          description: "!text-white/80",
          toast: "!bg-black !border-gray-700",
          success: "!bg-black !border-gray-700",
          error: "!bg-black !border-gray-700",
          warning: "!bg-black !border-gray-700",
          info: "!bg-black !border-gray-700",
        },
      }}
      style={
        {
          "--normal-bg": "#000000",
          "--normal-text": "#ffffff",
          "--normal-border": "#374151",
          "--success-bg": "#000000",
          "--success-text": "#ffffff",
          "--success-border": "#374151",
          "--error-bg": "#000000",
          "--error-text": "#ffffff",
          "--error-border": "#374151",
          "--warning-bg": "#000000",
          "--warning-text": "#ffffff",
          "--warning-border": "#374151",
          "--info-bg": "#000000",
          "--info-text": "#ffffff",
          "--info-border": "#374151",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
