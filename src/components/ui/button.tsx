import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"text-sm w-full font-semibold inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
	{
		variants: {
			variant: {
				default: "bg-base-main",
				"main-opacity": "bg-base-opacity-main",
				"main-opacity10": "bg-base-opacity10-main",
				dark: "bg-second-bg",
				link: "bg-transparent",
			},
			size: {
				default: "px-6 h-16",
				sm: "h-14 px-4",
				xs: "h-12 px-3 text-base font-medium",
				"2s": "h-10 px-2 font-medium",
				link: "h-[30px] px-2 font-medium",
			},
			rounded: {
				default: "rounded-2xl",
				"3xl": "rounded-3xl",
				bottom: "rounded-t-2xl rounded-b-[40px]",
			},
			text: {
				white: "text-white",
				dark: "text-base-bg",
				main: "text-base-main",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
			text: "white",
			rounded: "default",
		},
	}
);

function Button({
	className,
	variant,
	size,
	rounded,
	text,
	asChild = false,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot : "button";

	return (
		<Comp
			data-slot="button"
			className={cn(
				buttonVariants({ variant, size, rounded, text, className })
			)}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
