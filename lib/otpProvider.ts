/**
 * OTP provider abstraction: send OTP via SMS (Amazon Pinpoint) or dev console.
 * Set OTP_PROVIDER=pinpoint for production SMS; OTP_PROVIDER=dev for console logging.
 */

import { PinpointClient, SendMessagesCommand } from "@aws-sdk/client-pinpoint";

export interface OtpProvider {
  sendOtp(phone: string, code: string): Promise<void>;
}

/** Format phone to E.164 for Pinpoint (e.g. 9876543210 + country 91 -> +919876543210). */
function toE164(phone: string, defaultCountryCode: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10 && defaultCountryCode) {
    return `+${defaultCountryCode.replace(/\D/g, "")}${digits}`;
  }
  if (digits.startsWith("0")) return `+${defaultCountryCode}${digits.slice(1)}`;
  if (digits.length >= 10) return `+${digits}`;
  return phone;
}

/**
 * Amazon Pinpoint SMS provider. Requires PINPOINT_APPLICATION_ID, AWS_REGION, and
 * AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY (or IAM role). Optional: PINPOINT_DEFAULT_COUNTRY_CODE (e.g. 91).
 */
export function createPinpointOtpProvider(): OtpProvider {
  const applicationId = process.env.PINPOINT_APPLICATION_ID;
  const region = process.env.AWS_REGION ?? "ap-south-1";
  const countryCode = process.env.PINPOINT_DEFAULT_COUNTRY_CODE ?? "91";

  if (!applicationId?.trim()) {
    throw new Error("PINPOINT_APPLICATION_ID is required when OTP_PROVIDER=pinpoint");
  }

  const client = new PinpointClient({
    region,
    ...(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          },
        }
      : {}),
  });

  return {
    async sendOtp(phone: string, code: string) {
      const e164 = toE164(phone, countryCode);
      const message = process.env.PINPOINT_OTP_MESSAGE ?? `Your verification code is ${code}. Valid for 5 minutes.`;

      const command = new SendMessagesCommand({
        ApplicationId: applicationId,
        MessageRequest: {
          Addresses: {
            [e164]: { ChannelType: "SMS" },
          },
          MessageConfiguration: {
            SMSMessage: {
              Body: message.replace(/\{code\}/g, code),
              MessageType: "TRANSACTIONAL",
              ...(process.env.PINPOINT_ORIGINATION_NUMBER && {
                OriginationNumber: process.env.PINPOINT_ORIGINATION_NUMBER,
              }),
            },
          },
        },
      });

      const response = await client.send(command);
      const result = response.MessageResponse?.Result?.[e164];
      if (result && result.DeliveryStatus !== "SUCCESSFUL") {
        throw new Error(result.StatusMessage ?? `SMS delivery failed: ${result.DeliveryStatus}`);
      }
    },
  };
}

/**
 * Dev implementation: log OTP to console.
 * When OTP_PROVIDER=dev, allowed in any environment (for local/staging). Otherwise blocked in production.
 */
export function createDevOtpProvider(): OtpProvider {
  return {
    async sendOtp(phone: string, code: string) {
      const explicitDev = process.env.OTP_PROVIDER?.toLowerCase() === "dev";
      if (process.env.NODE_ENV === "production" && !explicitDev) {
        throw new Error("Dev OTP provider must not be used in production. Set OTP_PROVIDER=dev for local testing or use a real SMS provider.");
      }
      // eslint-disable-next-line no-console
      console.log(`[OTP Dev] phone=${phone} code=${code}`);
    },
  };
}

/**
 * Get the configured OTP provider. Use OTP_PROVIDER=pinpoint for Amazon Pinpoint SMS; dev for console.
 */
let provider: OtpProvider | null = null;

export function getOtpProvider(): OtpProvider {
  if (!provider) {
    const kind = (process.env.OTP_PROVIDER ?? "dev").toLowerCase();
    if (kind === "pinpoint") {
      provider = createPinpointOtpProvider();
    } else if (kind === "dev" || process.env.NODE_ENV !== "production") {
      provider = createDevOtpProvider();
    } else {
      throw new Error("OTP_PROVIDER must be set in production (e.g. pinpoint or dev). Use pinpoint for SMS.");
    }
  }
  return provider;
}
