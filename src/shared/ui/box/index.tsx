import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, FC, PropsWithChildren } from "react";

interface Props extends PropsWithChildren {
	className?: string;
}

const boxVariants = cva(
	"w-full flex items-center justify-center gap-3 px-3 py-8",
	{
		variants: {
			variant: {
				default: "bg-second-bg",
				dark: "bg-base-bg",
				white: "bg-white-gray",
			},
			direction: {
				column: "flex-col",
				row: "flex-row",
			},
			align: {
				start: "items-start",
				center: "items-center",
				end: "items-end",
				stretch: "items-stretch",
			},
			justify: {
				start: "justify-start",
				center: "justify-center",
				end: "justify-end",
				between: "justify-between",
				around: "justify-around",
			},
			rounded: {
				"2s": "rounded-[8px]",
				xl: "rounded-xl",
				"2xl": "rounded-2xl",
				"3xl": "rounded-3xl",
			},
		},
		defaultVariants: {
			variant: "default",
			direction: "column",
			align: "center",
			justify: "center",
			rounded: "xl",
		},
	}
);

export const Box: FC<
	Props &
		ComponentProps<"div"> &
		VariantProps<typeof boxVariants> & {
			asChild?: boolean;
		}
> = ({ children, variant, direction, align, justify, rounded, className }) => {
	return (
		<div
			className={cn(
				boxVariants({ variant, direction, align, justify, rounded, className })
			)}
		>
			{children}
		</div>
	);
};
