import {
  MAX_LIVE_LOCATION_AGE_MS,
  milesBetween,
} from "./geo.ts";

import { durationFor } from "./pricing.ts";

export function toMinutes(value: string) {
  const [hours, minutes] = value
    .slice(0, 5)
    .split(":")
    .map(Number);

  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes)
  ) {
    return NaN;
  }

  return hours * 60 + minutes;
}

export function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function fromMinutes(minutes: number) {
  const normalized = Math.max(
    0,
    Math.min(minutes, 23 * 60 + 59),
  );

  return `${pad(Math.floor(normalized / 60))}:${pad(
    normalized % 60,
  )}`;
}

export function weekday(date: string) {
  return new Date(`${date}T12:00:00Z`).getUTCDay();
}

export function getBookingEnd(
  startTime: string,
  scheduledEnd: string | null | undefined,
  fallbackDuration = 60,
) {
  const start = toMinutes(startTime);

  if (!Number.isFinite(start)) {
    return NaN;
  }

  if (scheduledEnd) {
    const parsed = toMinutes(scheduledEnd);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return start + fallbackDuration;
}

export function overlaps(
  start: number,
  end: number,
  bookingStart: number,
  bookingEnd: number,
) {
  return start < bookingEnd && end > bookingStart;
}

export function slotFits(
  start: number,
  duration: number,
  workStart: number,
  workEnd: number,
  bookings: any[],
) {
  if (
    !Number.isFinite(start) ||
    !Number.isFinite(duration) ||
    !Number.isFinite(workStart) ||
    !Number.isFinite(workEnd)
  ) {
    return false;
  }

  const end = start + duration;

  if (start < workStart || end > workEnd) {
    return false;
  }

  return !bookings.some((booking) => {
    const bookingStart = toMinutes(
      String(booking.appointment_time || "00:00"),
    );

    if (!Number.isFinite(bookingStart)) {
      return false;
    }

    const bookingEnd = getBookingEnd(
      String(booking.appointment_time || "00:00"),
      booking.scheduled_end,
    );

    return overlaps(
      start,
      end,
      bookingStart,
      bookingEnd,
    );
  });
}

function technicianSupportsServices(
  technician: any,
  serviceIds: string[],
) {
  if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
    return true;
  }

  /*
   * An empty technician.services array means:
   * "this technician has not been restricted to specific
   * services yet."
   */
  if (
    !Array.isArray(technician.services) ||
    technician.services.length === 0
  ) {
    return true;
  }

  return serviceIds.every((id) =>
    technician.services.includes(id),
  );
}

function technicianHasTimeOff(
  timeOff: any[],
  technicianId: string,
  date: string,
) {
  return timeOff.some(
    (item) =>
      item.technician_id === technicianId &&
      item.date === date,
  );
}

function getLatestPing(technician: any) {
  if (
    !Array.isArray(technician.location_pings) ||
    technician.location_pings.length === 0
  ) {
    return null;
  }

  return [...technician.location_pings]
    .sort(
      (a, b) =>
        new Date(b.recorded_at).getTime() -
        new Date(a.recorded_at).getTime(),
    )[0];
}

function getTechnicianPoint(technician: any) {
  const ping = getLatestPing(technician);

  if (ping) {
    const recordedAt = new Date(
      ping.recorded_at,
    ).getTime();

    const live =
      Number.isFinite(recordedAt) &&
      Date.now() - recordedAt <=
        MAX_LIVE_LOCATION_AGE_MS;

    if (live) {
      const lat = Number(ping.latitude);
      const lng = Number(ping.longitude);

      if (
        Number.isFinite(lat) &&
        Number.isFinite(lng)
      ) {
        return {
          lat,
          lng,
          live: true,
          locationSource: "live",
        };
      }
    }
  }

  const lat = Number(technician.base_lat);
  const lng = Number(technician.base_lng);

  if (
    Number.isFinite(lat) &&
    Number.isFinite(lng)
  ) {
    return {
      lat,
      lng,
      live: false,
      locationSource: "base",
    };
  }

  return null;
}

export function eligibleTechnicians({
  technicians,
  availability,
  timeOff,
  bookings,
  date,
  serviceIds,
  time,
  customer,
  requireLive = false,
}: {
  technicians: any[];
  availability: any[];
  timeOff: any[];
  bookings: any[];
  date: string;
  serviceIds: string[];
  time: string;
  customer: { lat: number; lng: number };
  requireLive?: boolean;
}) {
  const wd = weekday(date);
  const requested = toMinutes(time);
  const duration = durationFor(serviceIds);

  if (!Number.isFinite(requested)) {
    return [];
  }

  return technicians
    .filter(
      (technician) =>
        technician.active &&
        technician.available_for_jobs,
    )

    .filter(
      (technician) =>
        !technicianHasTimeOff(
          timeOff,
          technician.id,
          date,
        ),
    )

    .filter((technician) =>
      technicianSupportsServices(
        technician,
        serviceIds,
      ),
    )

    .map((technician) => {
      const technicianAvailability =
        availability.filter(
          (item) =>
            item.technician_id === technician.id &&
            item.weekday === wd &&
            item.active,
        );

      if (technicianAvailability.length === 0) {
        return null;
      }

      const technicianBookings = bookings.filter(
        (booking) =>
          booking.assigned_technician_id ===
          technician.id,
      );

      /*
       * A technician can have multiple working periods
       * on the same day.
       *
       * Example:
       * 08:00–12:00
       * 13:00–17:00
       */
      const fitsAtLeastOnePeriod =
        technicianAvailability.some((period) => {
          return slotFits(
            requested,
            duration,
            toMinutes(period.start_time),
            toMinutes(period.end_time),
            technicianBookings,
          );
        });

      if (!fitsAtLeastOnePeriod) {
        return null;
      }

      const point = getTechnicianPoint(
        technician,
      );

      if (!point) {
        return null;
      }

      if (requireLive && !point.live) {
        return null;
      }

      const distanceMiles = milesBetween(
        customer,
        point,
      );

      return {
        ...technician,
        live: point.live,
        locationSource: point.locationSource,
        distanceMiles,
        scheduledDurationMinutes: duration,
      };
    })
    .filter(Boolean)
    .sort(
      (a: any, b: any) =>
        a.distanceMiles - b.distanceMiles,
    );
}