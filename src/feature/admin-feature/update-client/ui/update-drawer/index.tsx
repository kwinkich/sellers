// components/add-licenses-drawer.tsx
import { Button } from "@/components/ui/button";
import { DatePickerFloatingLabel } from "@/components/ui/datePickerFloating";
import {
	Drawer,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import { SelectFloatingLabel } from "@/components/ui/selectFloating";
import { useState } from "react";

interface AddLicensesDrawerProps {
	onSave: (licenseCount: number, licenseExpiresAt: Date) => void;
	currentLicenseCount: number;
	disabled?: boolean;
}

export function AddLicensesDrawer({
	onSave,
	currentLicenseCount,
	disabled,
}: AddLicensesDrawerProps) {
	const [open, setOpen] = useState(false);
	const [licenseCount, setLicenseCount] = useState(
		currentLicenseCount.toString()
	);
	const [licenseExpiresAt, setLicenseExpiresAt] = useState<Date>();

	const handleSave = () => {
		if (licenseExpiresAt) {
			onSave(parseInt(licenseCount), licenseExpiresAt);
			setOpen(false);
		}
	};

	return (
		<Drawer open={open} onOpenChange={setOpen}>
			<DrawerTrigger asChild>
				<Button size="2s" className="w-[90px]" disabled={disabled}>
					Добавить
				</Button>
			</DrawerTrigger>
			<DrawerContent className="data-[vaul-drawer-direction=bottom]:rounded-t-3xl!">
				<div className="mx-auto w-full px-2 pb-2">
					<DrawerHeader>
						<DrawerTitle className="text-2xl font-medium pb-4">
							Добавление лицензии
						</DrawerTitle>
					</DrawerHeader>

					<div className="space-y-3 pb-4">
						<SelectFloatingLabel
							placeholder="Количество лицензий"
							value={licenseCount}
							onValueChange={setLicenseCount}
							options={Array.from({ length: 12 }, (_, i) => i + 1).map(
								(number) => ({
									value: number.toString(),
									label: `${number} ${
										number === 1
											? "лицензия"
											: number < 5
											? "лицензии"
											: "лицензий"
									}`,
								})
							)}
						/>

						<DatePickerFloatingLabel
							placeholder="Дата окончания лицензий"
							value={licenseExpiresAt}
							onValueChange={setLicenseExpiresAt}
						/>
					</div>

					<DrawerFooter className="w-full px-0">
						<Button
							onClick={handleSave}
							className="w-full"
							rounded="bottom"
							disabled={!licenseExpiresAt}
						>
							Сохранить
						</Button>
					</DrawerFooter>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
