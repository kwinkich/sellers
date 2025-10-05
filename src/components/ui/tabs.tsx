import { cn } from "@/lib/utils";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const tabsListVariants = cva(
	"inline-flex min-h-10 w-full items-center justify-center rounded-lg p-1",
	{
		variants: {
			variant: {
				default: "bg-muted text-muted-foreground",
				dark: "bg-base-bg text-white",
				second: "bg-second-bg text-foreground",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	}
);

const tabsTriggerVariants = cva(
	"inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center  rounded-md border border-transparent px-3 py-2 text-sm  font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
	{
		variants: {
			variant: {
				default: [
					"text-foreground dark:text-muted-foreground",
					"data-[state=active]:bg-background dark:data-[state=active]:text-foreground",
					"dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30",
				],
				dark: [
					"text-white",
					"data-[state=active]:bg-second data-[state=active]:text-base-bg",
					"hover:text-second/80",
				],
				second: [
					"text-base-gray",
					"data-[state=active]:bg-base-bg data-[state=active]:text-white",
					"hover:bg-base-bg/50",
				],
			},
		},
		defaultVariants: {
			variant: "default",
		},
	}
);

function Tabs({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
	return (
		<TabsPrimitive.Root
			data-slot="tabs"
			className={cn("flex flex-col gap-2", className)}
			{...props}
		/>
	);
}

interface TabsListProps
	extends React.ComponentProps<typeof TabsPrimitive.List>,
		VariantProps<typeof tabsListVariants> {}

function TabsList({ className, variant, ...props }: TabsListProps) {
	return (
		<TabsPrimitive.List
			data-slot="tabs-list"
			className={cn(tabsListVariants({ variant, className }))}
			{...props}
		/>
	);
}

interface TabsTriggerProps
	extends React.ComponentProps<typeof TabsPrimitive.Trigger>,
		VariantProps<typeof tabsTriggerVariants> {}

function TabsTrigger({ className, variant, ...props }: TabsTriggerProps) {
	return (
		<TabsPrimitive.Trigger
			data-slot="tabs-trigger"
			className={cn(tabsTriggerVariants({ variant, className }))}
			{...props}
		/>
	);
}

function TabsContent({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
	return (
		<TabsPrimitive.Content
			data-slot="tabs-content"
			className={cn("flex-1 outline-none", className)}
			{...props}
		/>
	);
}

export {
	Tabs,
	TabsContent,
	TabsList,
	tabsListVariants,
	TabsTrigger,
	tabsTriggerVariants,
};
