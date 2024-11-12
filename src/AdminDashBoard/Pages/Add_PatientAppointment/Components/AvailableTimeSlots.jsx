import { useState } from 'react';

const AvailableTimeSlots = ({
    selectedDate,
    unavailableDates,
    appointments,
    onSelectTimeSlot,
    allButtonsDisabled,
    SelectedProcedureDuration,
}) => {
    const timeSlots = [];
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(8, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(17, 0, 0); // 5 PM as the end of the workday

    for (let time = new Date(startOfDay); time <= endOfDay; time.setMinutes(time.getMinutes() + 15)) {
        timeSlots.push(new Date(time));
    }

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Midnight for date comparison
    const isPastDate = selectedDate < currentDate;

    const isOverlappingWithAppointments = (slot) => {
        const slotEndTime = new Date(slot.getTime() + SelectedProcedureDuration * 60000);
        return appointments.some((appointment) => {
            const appointmentStart = new Date(appointment.start);
            const appointmentEnd = new Date(appointment.end);
            return slot < appointmentEnd && slotEndTime > appointmentStart;
        });
    };

    return (
        <div className="flex flex-col items-center p-4 w-full max-w-3xl mx-auto sm:p-6">
            <div className="flex items-center justify-center w-full mb-4 sm:mb-6">
                <div className="text-center">
                    <h3 className="text-lg font-bold sm:text-xl">Available Time Slots</h3>
                    <p className="text-gray-600">
                        {isNaN(selectedDate)
                            ? 'Invalid Date'
                            : selectedDate.toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            })}
                    </p>
                </div>
            </div>

            <div className="w-full">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                    {timeSlots.map((slot, index) => {
                        const isUnavailable = unavailableDates.some(
                            (unavailable) =>
                                slot >= new Date(unavailable.start) && slot < new Date(unavailable.end)
                        );

                        const isBooked = appointments.some((appointment) => {
                            const appointmentStart = new Date(appointment.start);
                            const appointmentEnd = new Date(appointment.end);
                            return slot >= appointmentStart && slot < appointmentEnd;
                        });

                        const isSlotInThePast = slot < currentDate;
                        const isOverlapping = isOverlappingWithAppointments(slot);
                        const slotEndTime = new Date(slot.getTime() + SelectedProcedureDuration * 60000);
                        const isExceedingRemainingTime = slotEndTime > endOfDay;

                        const is5pmSlot = slot.getHours() === 17 && slot.getMinutes() === 0;
                        const isDisabled =
                            allButtonsDisabled ||
                            isUnavailable ||
                            isBooked ||
                            isPastDate ||
                            isSlotInThePast ||
                            isOverlapping ||
                            isExceedingRemainingTime ||
                            is5pmSlot;

                        // Set label and color based on disable reasons
                        let label;
                        let buttonClass;
                        if (is5pmSlot) {
                            label = 'Close';
                            buttonClass = 'bg-gray-500 text-white'; // Gray for "Close"
                        } else if (isSlotInThePast) {
                            label = 'Past';
                            buttonClass = 'bg-red-200 text-gray-500'; // Red for "Past"
                        } else if (isBooked) {
                            label = 'Reserved';
                            buttonClass = 'bg-yellow-300 text-gray-800'; // Yellow for "Reserved"
                        } else if (isOverlapping) {
                            label = 'Overlap';
                            buttonClass = 'bg-red-200 text-gray-500'; // Red for "Overlap"
                        } else if (isExceedingRemainingTime) {
                            label = 'Overtime';
                            buttonClass = 'bg-red-200 text-gray-500'; // Red for "Overtime"
                        } else if (isDisabled) {
                            label = 'Not Available';
                            buttonClass = 'bg-red-200 text-gray-500'; // Default red for other disabled
                        } else {
                            label = 'Available';
                            buttonClass = 'bg-green-100 text-gray-800 hover:bg-green-300'; // Green for available
                        }

                        return (
                            <button
                                key={index}
                                onClick={() => !isDisabled && onSelectTimeSlot(slot, selectedDate)}
                                className={`py-3 rounded-md text-sm w-full text-center ${buttonClass}`}
                                disabled={isDisabled}
                            >
                                {slot.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })} <br />
                                {label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AvailableTimeSlots;
