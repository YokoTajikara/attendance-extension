import * as React from "react";
import { DayPicker } from "react-day-picker";
import { ja } from "date-fns/locale";
import { cn } from "../../utils";

type WorkType = 'home' | 'office' | 'outside' | null;

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
	getWorkType?: (date: Date) => WorkType;
};

function Calendar({
	className,
	classNames,
	showOutsideDays = true,
	getWorkType,
	...props
}: CalendarProps) {
	const modifiers = {
		home: (date: Date) => getWorkType?.(date) === 'home',
		office: (date: Date) => getWorkType?.(date) === 'office',
		outside: (date: Date) => getWorkType?.(date) === 'outside',
		attended: (date: Date) => getWorkType?.(date) !== null,
	};

	const modifiersClassNames = {
		home: "work-type-home",
		office: "work-type-office",
		outside: "work-type-outside",
		attended: "rdp-day_attended",
	};

	return (
		<DayPicker
			showOutsideDays={showOutsideDays}
			className={cn("p-3", className)}
			modifiers={modifiers}
			modifiersClassNames={modifiersClassNames}
			classNames={{
				months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
				month: "space-y-4",
				caption: "flex justify-center pt-1 relative items-center",
				caption_label: "text-sm font-medium",
				nav: "space-x-1 flex items-center",
				nav_button: cn(
					"h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
				),
				nav_button_previous: "absolute left-1",
				nav_button_next: "absolute right-1",
				table: "w-full border-collapse space-y-1",
				head_row: "flex",
				head_cell: "text-slate-500 rounded-md w-9 font-normal text-[0.8rem]",
				row: "flex w-full mt-2",
				cell: "text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
				day: cn(
					"h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-slate-100 rounded-md"
				),
				day_selected:
					"bg-slate-900 text-slate-50 hover:bg-slate-900 hover:text-slate-50 focus:bg-slate-900 focus:text-slate-50",
				day_today: "bg-slate-100",
				day_outside: "text-slate-400",
				day_disabled: "text-slate-500 opacity-50",
				day_range_middle:
					"aria-selected:bg-slate-100 aria-selected:text-slate-900",
				day_hidden: "invisible",
				...classNames,
			}}
			locale={ja}
			{...props}
		/>
	);
}
Calendar.displayName = "Calendar";

export { Calendar };