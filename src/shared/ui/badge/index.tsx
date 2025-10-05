import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { FC } from "react";

const badgeVariants = cva(
	"inline-flex items-center justify-center rounded-[8px] font-medium",
	{
		variants: {
			variant: {
				main: "bg-base-main text-white",
				gray: "bg-fourth-gray text-base-gray",
				"main-opacity": "bg-base-opacity10-main text-base-main",
				"gray-opacity": "bg-base-opacity10-gray text-base-gray",
				"red-opacity": "bg-base-opacity-red text-base-red",
			},
			size: {
				sm: "px-1 py-0.5 text-xs",
				md: "px-1.5 py-1 text-xs",
				lg: "px-3 py-1 text-xs",
			},
		},
		defaultVariants: {
			variant: "main",
			size: "lg",
		},
	}
);

interface BadgeProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof badgeVariants> {
	label: string | number;
}

export const Badge: FC<BadgeProps> = ({
	label,
	variant,
	size,
	className,
	...props
}) => {
	return (
		<div className={cn(badgeVariants({ variant, size, className }))} {...props}>
			{label}
		</div>
	);
};
