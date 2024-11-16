import { useState } from 'react';

const AvailableTimeSlots = ({
    selectedDate,
    unavailableDates,
    appointments,
    onSelectTimeSlot,
    allButtonsDisabled,
    SelectedProcedureDuration,
}) => {
    const [showAM, setShowAM] = useState(true); // AM slots visible by default
    const [showPM, setShowPM] = useState(false); // PM slots hidden by default

    const getEndTime = (date) => {
        const day = date.getDay(); // Get the day of the week (0 = Sunday, 6 = Saturday)

        return day === 0 || day === 6 ? 17 : 20; // Saturday and Sunday -> 5 PM, Mon-Fri -> 8 PM
    };

    const endtime = getEndTime(new Date(selectedDate));
    const timeSlotsAM = [];
    const timeSlotsPM = [];
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(8, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(endtime, 0, 0);

    // Generate time slots, excluding 12:00 PM to 1:00 PM
    for (let time = new Date(startOfDay); time <= endOfDay; time.setMinutes(time.getMinutes() + 15)) {
        if (time.getHours() === 12) continue; // Skip 12:00 PM to 12:59 PM
        if (time.getHours() < 12) {
            timeSlotsAM.push(new Date(time)); // AM slots
        } else {
            timeSlotsPM.push(new Date(time)); // PM slots
        }
    }

    const now = new Date();

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

            {/* Toggle AM/PM Section */}
            <div className="flex justify-center gap-4 mb-6">
                <button
                    onClick={() => {
                        setShowAM(true); // Show AM
                        setShowPM(false); // Hide PM
                    }}
                    className={`px-4 py-2 ${showAM ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'}`}
                >
                    AM
                </button>
                <button
                    onClick={() => {
                        setShowAM(false); // Hide AM
                        setShowPM(true); // Show PM
                    }}
                    className={`px-4 py-2 ${showPM ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'}`}
                >
                    PM
                </button>
            </div>

            <div className="w-full">
                {/* AM Section */}
                {showAM && (
                    <div className="mb-6">
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                            {timeSlotsAM.map((slot, index) => {
                                const isUnavailable = unavailableDates.some(
                                    (unavailable) => slot >= new Date(unavailable.start) && slot < new Date(unavailable.end)
                                );

                                const isBooked = appointments.some((appointment) => {
                                    const appointmentStart = new Date(appointment.start);
                                    const appointmentEnd = new Date(appointment.end);
                                    return slot >= appointmentStart && slot < appointmentEnd;
                                });

                                const isSlotInThePast = slot < now && !isBooked && !isUnavailable;
                                const isOverlapping = isOverlappingWithAppointments(slot);
                                const slotEndTime = new Date(slot.getTime() + SelectedProcedureDuration * 60000);
                                const isExceedingAMLimit = slotEndTime > new Date(selectedDate).setHours(12, 0, 0);
                                const isExceedingRemainingTime = slotEndTime > endOfDay;

                                const isDisabled =
                                    allButtonsDisabled ||
                                    isUnavailable ||
                                    isBooked ||
                                    isSlotInThePast ||
                                    isOverlapping ||
                                    isExceedingRemainingTime ||
                                    isExceedingAMLimit;

                                let label;
                                let buttonClass;
                                if (isSlotInThePast) {
                                    label = 'Past';
                                    buttonClass = 'bg-red-200 text-gray-500';
                                } else if (isBooked) {
                                    label = 'Reserved';
                                    buttonClass = 'bg-yellow-300 text-gray-800';
                                } else if (isOverlapping) {
                                    label = 'Overlap';
                                    buttonClass = 'bg-red-200 text-gray-500';
                                } else if (isExceedingAMLimit) {
                                    label = 'Exceeds AM';
                                    buttonClass = 'bg-red-200 text-gray-500';
                                } else if (isDisabled) {
                                    label = 'Not Available';
                                    buttonClass = 'bg-red-200 text-gray-500';
                                } else {
                                    label = 'Available';
                                    buttonClass = 'bg-green-100 text-gray-800 hover:bg-green-300';
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
                )}

                {/* PM Section */}
                {showPM && (
                    <div>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                            {timeSlotsPM.map((slot, index) => {
                                const isUnavailable = unavailableDates.some(
                                    (unavailable) => slot >= new Date(unavailable.start) && slot < new Date(unavailable.end)
                                );

                                const isBooked = appointments.some((appointment) => {
                                    const appointmentStart = new Date(appointment.start);
                                    const appointmentEnd = new Date(appointment.end);
                                    return slot >= appointmentStart && slot < appointmentEnd;
                                });

                                const isSlotInThePast = slot < now && !isBooked && !isUnavailable;
                                const isOverlapping = isOverlappingWithAppointments(slot);
                                const slotEndTime = new Date(slot.getTime() + SelectedProcedureDuration * 60000);
                                const isExceedingRemainingTime = slotEndTime > endOfDay;

                                const isDisabled =
                                    allButtonsDisabled ||
                                    isUnavailable ||
                                    isBooked ||
                                    isSlotInThePast ||
                                    isOverlapping ||
                                    isExceedingRemainingTime;

                                let label;
                                let buttonClass;
                                if (isSlotInThePast) {
                                    label = 'Past';
                                    buttonClass = 'bg-red-200 text-gray-500';
                                } else if (isBooked) {
                                    label = 'Reserved';
                                    buttonClass = 'bg-yellow-300 text-gray-800';
                                } else if (isOverlapping) {
                                    label = 'Overlap';
                                    buttonClass = 'bg-red-200 text-gray-500';
                                } else if (isDisabled) {
                                    label = 'Not Available';
                                    buttonClass = 'bg-red-200 text-gray-500';
                                } else {
                                    label = 'Available';
                                    buttonClass = 'bg-green-100 text-gray-800 hover:bg-green-300';
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
                )}
            </div>
        </div>
    );
};

export default AvailableTimeSlots;
