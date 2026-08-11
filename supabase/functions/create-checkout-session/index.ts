import {
  SERVICE_BOOKING_FEES,
  COUPONS,
  MILEAGE_RATE,
} from "../_shared/pricing.ts";

import {
  corsHeaders,
  json,
} from "../_shared/supabase.ts";

import { isGeorgia } from "../_shared/geo.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== "POST") {
      return json(
        { error: "Method not allowed" },
        405,
      );
    }

    const body = await req.json();

    const {
      serviceId,
      serviceIds,
      serviceName,
      vehicle,
      appointment,
      contact,
      location,
      distanceMiles,
      couponCode,
      extraInformation,
      assignedTechnicianId,
      dispatchMode = "scheduled",
    } = body;

    /*
     * Support the old single-service payload while
     * allowing the new multi-service booking flow.
     */
    const selectedServiceIds: string[] =
      Array.isArray(serviceIds) &&
      serviceIds.length > 0
        ? serviceIds
        : serviceId
          ? [serviceId]
          : [];

    if (
      selectedServiceIds.length === 0 ||
      !appointment?.date ||
      !appointment?.time ||
      !contact?.name ||
      !contact?.phone ||
      !contact?.email
    ) {
      return json(
        {
          error:
            "Missing required booking information",
        },
        400,
      );
    }

    /*
     * Make sure every selected service actually exists
     * in the server-side pricing table.
     */
    const invalidService =
      selectedServiceIds.find(
        (id) =>
          SERVICE_BOOKING_FEES[id] === undefined,
      );

    if (invalidService) {
      return json(
        {
          error: `Invalid service: ${invalidService}`,
        },
        400,
      );
    }

    /*
     * The frontend may provide the customer location.
     * We validate it server-side and only allow Georgia.
     */
    let customerLocation:
      | {
          lat: number;
          lng: number;
        }
      | null = null;

    if (location) {
      const lat = Number(
        location.lat ??
          location.latitude,
      );

      const lng = Number(
        location.lng ??
          location.longitude,
      );

      if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lng)
      ) {
        return json(
          {
            error:
              "Invalid customer location",
          },
          400,
        );
      }

      if (!isGeorgia(lat, lng)) {
        return json(
          {
            error:
              "Bookings are currently limited to Georgia locations.",
          },
          400,
        );
      }

      customerLocation = {
        lat,
        lng,
      };
    }

    const distance = Number(
      distanceMiles,
    );

    if (
      !Number.isFinite(distance) ||
      distance < 0 ||
      distance > 500
    ) {
      return json(
        {
          error:
            "Invalid service distance",
        },
        400,
      );
    }

    const bookingFee = selectedServiceIds.reduce(
      (sum, id) =>
        sum +
        SERVICE_BOOKING_FEES[id],
      0,
    );

    const mileageCharge = Number(
      (
        distance *
        MILEAGE_RATE
      ).toFixed(2),
    );

    const subtotal = Number(
      (
        bookingFee +
        mileageCharge
      ).toFixed(2),
    );

    const normalizedCoupon =
      couponCode
        ?.trim()
        .toUpperCase() || "";

    const discountPercent =
      COUPONS[
        normalizedCoupon
      ] || 0;

    const discount = Number(
      (
        subtotal *
        (discountPercent / 100)
      ).toFixed(2),
    );

    const total = Number(
      Math.max(
        subtotal - discount,
        0,
      ).toFixed(2),
    );

    if (total <= 0) {
      return json(
        {
          error:
            "Invalid booking total",
        },
        400,
      );
    }

    const supabaseUrl =
      Deno.env.get(
        "SUPABASE_URL",
      );

    const serviceRoleKey =
      Deno.env.get(
        "VISO_SUPABASE_SERVICE_ROLE_KEY",
      );

    const stripeSecretKey =
      Deno.env.get(
        "STRIPE_SECRET_KEY",
      );

    if (
      !supabaseUrl ||
      !serviceRoleKey ||
      !stripeSecretKey
    ) {
      console.error(
        "Missing server environment variables.",
      );

      return json(
        {
          error:
            "Booking service is not configured.",
        },
        500,
      );
    }

    /*
     * Store a normalized service list.
     *
     * service_id/service_name remain populated for
     * backwards compatibility with your existing table.
     */
    const primaryServiceId =
      selectedServiceIds[0];

    const primaryServiceName =
      serviceName ||
      selectedServiceIds.join(", ");

    const bookingResponse =
      await fetch(
        `${supabaseUrl}/rest/v1/bookings`,
        {
          method: "POST",
          headers: {
            apikey:
              serviceRoleKey,
            Authorization:
              `Bearer ${serviceRoleKey}`,
            "Content-Type":
              "application/json",
            Prefer:
              "return=representation",
          },
          body: JSON.stringify({
            status: "pending",
            payment_status:
              "pending",

            service_id:
              primaryServiceId,

            service_name:
              primaryServiceName,

            service_ids:
              selectedServiceIds,

            vehicle_year:
              vehicle?.year || null,

            vehicle_make:
              vehicle?.make || null,

            vehicle_model:
              vehicle?.model || null,

            appointment_date:
              appointment.date,

            appointment_time:
              appointment.time,

            scheduled_start:
              appointment
                .scheduledStart ||
              null,

            scheduled_end:
              appointment
                .scheduledEnd ||
              null,

            customer_name:
              contact.name.trim(),

            customer_phone:
              contact.phone.trim(),

            customer_email:
              contact.email.trim(),

            location:
              customerLocation,

            distance_miles:
              distance,

            booking_fee:
              bookingFee,

            mileage_rate:
              MILEAGE_RATE,

            mileage_charge:
              mileageCharge,

            subtotal,

            discount,

            total,

            coupon_code:
              discountPercent
                ? normalizedCoupon
                : null,

            extra_information:
              extraInformation
                ?.trim() || null,

            assigned_technician_id:
              assignedTechnicianId ||
              null,

            dispatch_mode:
              dispatchMode,
          }),
        },
      );

    if (!bookingResponse.ok) {
      const errorText =
        await bookingResponse.text();

      console.error(
        "Supabase booking error:",
        errorText,
      );

      return json(
        {
          error:
            "Could not create booking",
        },
        500,
      );
    }

    const bookings =
      await bookingResponse.json();

    const booking =
      bookings[0];

    if (!booking) {
      return json(
        {
          error:
            "Booking was not created",
        },
        500,
      );
    }

    const origin =
      req.headers.get(
        "origin",
      ) ||
      "http://localhost:5173";

    const stripeParams =
      new URLSearchParams();

    stripeParams.set(
      "line_items[0][price_data][currency]",
      "usd",
    );

    stripeParams.set(
      "line_items[0][price_data][product_data][name]",
      primaryServiceName,
    );

    stripeParams.set(
      "line_items[0][price_data][product_data][description]",
      `${appointment.date} at ${appointment.time} · Viso Mobile Autocare`,
    );

    stripeParams.set(
      "line_items[0][price_data][unit_amount]",
      String(
        Math.round(
          total * 100,
        ),
      ),
    );

    stripeParams.set(
      "line_items[0][quantity]",
      "1",
    );

    stripeParams.set(
      "customer_email",
      contact.email.trim(),
    );

    stripeParams.set(
      "mode",
      "payment",
    );

    stripeParams.set(
      "success_url",
      `${origin}/booking?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    );

    stripeParams.set(
      "cancel_url",
      `${origin}/booking?payment=cancelled`,
    );

    stripeParams.set(
      "metadata[booking_id]",
      booking.id,
    );

    stripeParams.set(
      "metadata[service_id]",
      primaryServiceId,
    );

    stripeParams.set(
      "metadata[service_ids]",
      JSON.stringify(
        selectedServiceIds,
      ),
    );

    stripeParams.set(
      "metadata[customer_email]",
      contact.email.trim(),
    );

    const stripeResponse =
      await fetch(
        "https://api.stripe.com/v1/checkout/sessions",
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${stripeSecretKey}`,
            "Content-Type":
              "application/x-www-form-urlencoded",
          },
          body:
            stripeParams.toString(),
        },
      );

    const stripeSession =
      await stripeResponse.json();

    if (!stripeResponse.ok) {
      console.error(
        "Stripe error:",
        stripeSession,
      );

      return json(
        {
          error:
            "Could not create Stripe checkout session",
        },
        500,
      );
    }

    await fetch(
      `${supabaseUrl}/rest/v1/bookings?id=eq.${booking.id}`,
      {
        method: "PATCH",
        headers: {
          apikey:
            serviceRoleKey,
          Authorization:
            `Bearer ${serviceRoleKey}`,
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          stripe_checkout_session_id:
            stripeSession.id,

          updated_at:
            new Date().toISOString(),
        }),
      },
    );

    return json({
      checkoutUrl:
        stripeSession.url,

      bookingId:
        booking.id,
    });
  } catch (error) {
    console.error(
      "Checkout error:",
      error,
    );

    return json(
      {
        error:
          "Unexpected checkout error",
      },
      500,
    );
  }
});